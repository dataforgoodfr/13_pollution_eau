# pipelines/tasks/geojson_processor.py

import json
import logging
from pathlib import Path

import pandas as pd
from tqdm import tqdm

from pipelines.config.config import get_s3_path_geojson
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


class GeoJSONProcessor:
    def __init__(self):
        self.communes_in_db_not_in_geojson = set()
        self.communes_in_geojson_not_in_db = set()

    def merge_geojson_with_results(
        self, geojson_path: str, results_df: pd.DataFrame, output_path: str
    ) -> str:
        """
        Merge GeoJSON with commuunes analysed data

        Args:
            geojson_path: Path to input GeoJSON file
            results_df: DataFrame containing commune results
            output_path: Path where to save the merged GeoJSON
        """
        # Load GeoJSON
        with open(geojson_path, "r") as f:
            data_geo = json.load(f)

        # Process features
        data_geo_features = data_geo["features"]

        # Create lookup dict for faster processing
        results_lookup = (
            results_df.groupby("commune_code_insee")
            .apply(
                lambda x: {row["annee"]: row["resultat_cvm"] for _, row in x.iterrows()}
            )
            .to_dict()
        )

        # Track communes in GeoJSON
        communes_in_geojson = {}

        # Process features
        for feature in tqdm(data_geo_features, desc="Processing communes"):
            code_insee = feature["properties"].get("com_code")
            name_insee = feature["properties"].get("com_name")

            if code_insee:
                code_insee = code_insee[0]
                name_insee = name_insee[0]
                communes_in_geojson[code_insee] = name_insee

                properties = {
                    "commune_code_insee": code_insee,
                    "commune_nom": name_insee,
                    "resultat_cvm": results_lookup.get(code_insee, {}),
                }

                feature["properties"] = properties

        # Get communes names from database
        communes_db_names = dict(
            zip(results_df["commune_code_insee"], results_df["commune_nom"])
        )

        # Find missing communes in both sets
        self.communes_in_db_not_in_geojson = set(communes_db_names.keys()) - set(
            communes_in_geojson.keys()
        )
        self.communes_in_geojson_not_in_db = set(communes_in_geojson.keys()) - set(
            communes_db_names.keys()
        )

        # Save missing communes to csv file
        output_dir = Path(output_path).parent
        missing_communes_file = output_dir / "missing_communes.csv"

        missing_data = {
            "commune_code_insee": (
                list(self.communes_in_db_not_in_geojson)
                + list(self.communes_in_geojson_not_in_db)
            ),
            "commune_nom": (
                [
                    communes_db_names.get(code, "N/A")
                    for code in self.communes_in_db_not_in_geojson
                ]
                + [
                    communes_in_geojson.get(code, "N/A")
                    for code in self.communes_in_geojson_not_in_db
                ]
            ),
            "source": (
                ["database"] * len(self.communes_in_db_not_in_geojson)
                + ["geojson"] * len(self.communes_in_geojson_not_in_db)
            ),
        }
        pd.DataFrame(missing_data).to_csv(missing_communes_file, index=False)

        # Log results
        if (
            not self.communes_in_db_not_in_geojson
            and not self.communes_in_geojson_not_in_db
        ):
            logger.info("✅ All communes are present in both database and GeoJSON")
        else:
            logger.warning("❌ Some communes are missing in either database or GeoJSON")
            logger.info(
                f"Found {len(self.communes_in_db_not_in_geojson)} communes in databse not in GeoJSON"
            )
            logger.info(
                f"Found {len(self.communes_in_geojson_not_in_db)} communes in GeoJSON not in database"
            )
            logger.info(
                f"Full list of missing communes saved to: {missing_communes_file}"
            )

        # Save result
        new_geojson = {"type": "FeatureCollection", "features": data_geo_features}
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(new_geojson, f)

        return output_path

    @staticmethod
    def upload_geojson_to_storage(env: str, geojson_path: str):
        """
        Upload the GeoJSON file to Storage Object depending on the environment
        This requires setting the correct environment variables for the Scaleway credentials
        """
        s3 = ObjectStorageClient()
        s3_path = get_s3_path_geojson(env)

        s3.upload_object(local_path=geojson_path, file_key=s3_path, public_read=True)
        logger.info(f"✅ GeoJSON uploaded to s3://{s3.bucket_name}/{s3_path}")
