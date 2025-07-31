import json
import subprocess
from pathlib import Path
from typing import Dict, Any
import pandas as pd

from pipelines.config.config import get_s3_path_pmtiles
from pipelines.utils.logger import get_logger
from pipelines.utils.storage_client import ObjectStorageClient
from pipelines.tasks.config.common import CACHE_FOLDER
from pipelines.tasks.config.config_pmtiles import (
    config_pmtiles,
    value_columns,
)
from pipelines.tasks.client.core.duckdb_client import DuckDBClient

logger = get_logger(__name__)


class PmtilesClient:
    def __init__(self, duckdb_client: DuckDBClient):
        self.conn = duckdb_client.conn

    def get_pivot_keys(self, table_name: str) -> list:
        """Get all unique periode_categorie combinations for pivoting."""
        query = f"""
        SELECT DISTINCT 
            periode || '_' || categorie as pivot_key
        FROM {table_name}
        WHERE periode IS NOT NULL AND categorie IS NOT NULL
        ORDER BY periode, categorie
        """
        result = self.conn.sql(query).df()
        pivot_keys = result["pivot_key"].tolist()
        logger.info(f"Found {len(pivot_keys)} pivot keys for {table_name}")
        return pivot_keys

    def build_pivot_sql(self, pivot_keys: list, value_cols: list) -> str:
        """Build the SQL pivot clause for all combinations of pivot_keys and value_columns."""
        pivot_clauses = []

        for pivot_key in pivot_keys:
            for value_col in value_cols:
                # Create a column for each combination
                pivot_clauses.append(
                    f"MAX(CASE WHEN periode || '_' || categorie = '{pivot_key}' THEN {value_col} END) AS {pivot_key}_{value_col}"
                )

        return ",\n    ".join(pivot_clauses)

    def generate_geojson_data(self, data_type: str) -> str:
        """Generate pivoted data with geometry from Duckdb tables and export to JSON for a given data type."""
        if data_type not in config_pmtiles:
            raise ValueError(f"Data type '{data_type}' not found in configuration")

        config = config_pmtiles[data_type]
        logger.info(f"Starting {data_type} GeoJSON data generation")

        # Get pivot keys
        pivot_keys = self.get_pivot_keys(str(config["result_table"]))

        # Build pivot SQL
        pivot_sql = self.build_pivot_sql(pivot_keys, value_columns)

        # Build the select clause for ID columns
        id_select = ", ".join(config["id_columns"] or [])

        # Build geometry select clause
        geom_select = f"g.{config['geom_id_column']}"
        if config["geom_name_column"]:
            geom_select += f", g.{config['geom_name_column']}"
        geom_select += ", g.geom"

        # Main query with join and pivot
        query = f"""
        WITH pivoted_results AS (
            SELECT 
                {id_select},
                {pivot_sql}
            FROM {config['result_table']}
            GROUP BY {id_select}
        ),
        
        joined_data AS (
            SELECT 
                {geom_select},
                pr.*
            FROM {config['geom_table']} g
            LEFT JOIN pivoted_results pr ON g.{config['geom_id_column']} = pr.{config['result_id_column']}
            WHERE g.geom IS NOT NULL
        )
        
        SELECT * FROM joined_data
        """
        # Preview the SQL query (first 1000 characters)
        logger.info(
            f"Executing query (preview): {query[:1000]}{'...' if len(query) > 1000 else ''}"
        )

        # Execute query and get results
        result_df = self.conn.sql(query).df()
        logger.info(f"✅ Generated {len(result_df)} {data_type} records with geometry")

        # Convert timestamp columns to strings for JSON serialization
        for col in result_df.columns:
            if "date" in col.lower() or str(result_df[col].dtype).startswith(
                "datetime"
            ):
                try:
                    result_df[col] = result_df[col].dt.strftime("%Y-%m-%d %H:%M:%S")
                    logger.info(f"Converted {col} to string format")
                except (AttributeError, TypeError):
                    # Column might already be string or have NaN values
                    pass

        # Convert DataFrame to object type and replace NaN with None for JSON
        result_df = result_df.astype(object).where(pd.notnull(result_df), None)

        # Show preview of pivoted data
        logger.info("📊 Preview of pivoted data (first 5 rows):")
        id_cols = [str(config["geom_id_column"])]
        if config["geom_name_column"]:
            id_cols.append(str(config["geom_name_column"]))
        preview_cols = (
            id_cols
            + [col for col in result_df.columns if "bilan_annuel_2023_cvm" in col][:10]
        )
        if len(preview_cols) > len(id_cols):
            logger.info(f"\n{result_df[preview_cols].head().to_string()}")

        # Count rows lost in join
        total_records_query = f"SELECT COUNT(DISTINCT {config['result_id_column']}) as total FROM {config['result_table']} WHERE {config['result_id_column']} IS NOT NULL"
        total_records = self.conn.sql(total_records_query).df()["total"].iloc[0]
        unique_records_with_results = len(
            result_df[result_df[config["result_id_column"]].notna()]
        )
        lost_rows = total_records - unique_records_with_results
        logger.info(
            f"⚠️ Join statistics: {lost_rows} {data_type} records lost (no geometry match)"
        )

        # Convert to GeoJSON format
        geojson_features = []
        for _, row in result_df.iterrows():
            if row["geom"] is not None and row["geom"] != "":
                try:
                    geometry = json.loads(row["geom"])
                    properties = {k: v for k, v in row.items() if k not in ["geom"]}
                    # Convert empty strings back to None for cleaner JSON
                    # properties = {k: (None if v == "" else v) for k, v in properties.items()}

                    feature = {
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": properties,
                    }
                    geojson_features.append(feature)
                except json.JSONDecodeError:
                    logger.warning(
                        f"Invalid geometry JSON for {data_type} {row.get(str(config['geom_id_column']), 'unknown')}"
                    )

        geojson_data = {"type": "FeatureCollection", "features": geojson_features}

        # Save to file
        output_path = Path(CACHE_FOLDER) / f"{config['output_filename']}.geojson"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(geojson_data, f, ensure_ascii=False)

        logger.info(f"GeoJSON saved to {output_path}")

        # Show preview of JSON
        logger.info("Preview of GeoJSON (first 10000 characters):")
        with open(output_path, "r", encoding="utf-8") as f:
            preview_data = f.read(10000)
        logger.info(preview_data)
        logger.info("End of GeoJSON preview")

        return str(output_path)

    def convert_geojson_to_pmtiles(
        self, geojson_file: str, pmtiles_file: str, layer_name: str
    ):
        """Convert a GeoJSON file to PMTiles format using Tippecanoe."""
        logger.info(f"Converting {geojson_file} to PMTiles format using Tippecanoe")
        try:
            # Construct the Tippecanoe command
            command = [
                "tippecanoe",
                "-zg",  # Zoom levels
                "-o",  # output
                pmtiles_file,  # Output PMTiles file
                "--layer",  # layer name in vector tiles
                layer_name,
                "--coalesce-densest-as-needed",
                "--extend-zooms-if-still-dropping",
                geojson_file,  # Input GeoJSON file
            ]

            # Remove existing file if it exists
            if Path(pmtiles_file).exists():
                Path(pmtiles_file).unlink()

            # Run the command
            subprocess.run(command, check=True)
            logger.info(f"Successfully converted '{geojson_file}' to '{pmtiles_file}'")

        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Error during conversion: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ An error occurred: {e}")
            raise

    def upload_pmtiles_to_storage(self, env: str, pmtiles_path: str, s3_filename: str):
        """Upload the PMTiles file to Storage Object."""
        s3 = ObjectStorageClient()
        s3_path = get_s3_path_pmtiles(env, s3_filename)

        s3.upload_object(local_path=pmtiles_path, file_key=s3_path, public_read=True)
        logger.info(f"PMTiles uploaded to s3://{s3.bucket_name}/{s3_path}")

    def generate_pmtiles(self, env: str, upload: bool = False):
        """Generate both commune and UDI PMTiles files."""
        logger.info("Starting PMTiles generation")

        # Process both data types using configuration
        for data_type in config_pmtiles.keys():
            logger.info(f"Starting {data_type} PMTiles generation")
            config = config_pmtiles[data_type]

            # Generate data
            geojson_path = self.generate_geojson_data(data_type)
            pmtiles_path = str(
                Path(CACHE_FOLDER) / f"{config['output_filename']}.pmtiles"
            )

            # Convert to PMTiles
            self.convert_geojson_to_pmtiles(
                geojson_path, pmtiles_path, str(config["layer_name"] or "layer")
            )

            if upload:
                # Upload to storage
                self.upload_pmtiles_to_storage(
                    env, pmtiles_path, f"{config['output_filename']}.pmtiles"
                )

            logger.info(
                f"✅ {data_type} PMTiles generation completed: {config['output_filename']}.pmtiles"
            )

        logger.info("PMTiles generation completed successfully!")
