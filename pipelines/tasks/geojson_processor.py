# pipelines/tasks/geojson_processor.py

import json
import logging

import pandas as pd
from tqdm import tqdm

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

        # Get set of communes in database
        communes_in_db = set(results_df["commune_code_insee"])

        # Create lookup dict for faster processing
        results_lookup = (
            results_df.groupby("commune_code_insee")
            .apply(
                lambda x: {row["annee"]: row["resultat_cvm"] for _, row in x.iterrows()}
            )
            .to_dict()
        )

        # Track communes in GeoJSON
        communes_in_geojson = set()

        # Process features
        for feature in tqdm(data_geo_features, desc="Processing communes"):
            code_insee = feature["properties"].get("com_code")
            name_insee = feature["properties"].get("com_name")

            if code_insee:
                code_insee = code_insee[0]
                name_insee = name_insee[0]
                communes_in_geojson.add(code_insee)

                properties = {
                    "commune_code_insee": code_insee,
                    "commune_nom": name_insee,
                    "resultat_cvm": results_lookup.get(code_insee, {}),
                }

                feature["properties"] = properties

        # Find missing communes in both sets
        self.communes_in_db_not_in_geojson = communes_in_db - communes_in_geojson
        self.communes_in_geojson_not_in_db = communes_in_geojson - communes_in_db

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
        if self.communes_in_db_not_in_geojson:
            logger.debug(
                "10 first communes in database but not in GeoJSON: %s",
                sorted(list(self.communes_in_db_not_in_geojson))[:10],
            )

        if self.communes_in_geojson_not_in_db:
            logger.debug(
                "10 first communes in GeoJSON but not in database: %s",
                sorted(list(self.communes_in_geojson_not_in_db))[:10],
            )

        # Save result
        new_geojson = {"type": "FeatureCollection", "features": data_geo_features}
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(new_geojson, f)

        return output_path
