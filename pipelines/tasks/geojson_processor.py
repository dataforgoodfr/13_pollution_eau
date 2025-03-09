# pipelines/tasks/geojson_processor.py

import json
from typing import Any, Dict

import geopandas as gpd
import pandas as pd
from tqdm import tqdm


class GeoJSONProcessor:
    def __init__(self):
        pass

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

        # Process features
        for feature in tqdm(data_geo_features):
            code_insee = feature["properties"].get("com_code")
            name_insee = feature["properties"].get("com_name")

            if code_insee:
                code_insee = code_insee[0]
                name_insee = name_insee[0]

                properties = {
                    "commune_code_insee": code_insee,
                    "commune_nom": name_insee,
                    "resultat_cvm": results_lookup.get(code_insee, {}),
                }

                feature["properties"] = properties

        # Save result
        new_geojson = {"type": "FeatureCollection", "features": data_geo_features}
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(new_geojson, f)

        return output_path
