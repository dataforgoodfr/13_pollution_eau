# pipelines/tasks/geojson_processor.py

import json
import logging
import os

import duckdb
from tqdm import tqdm

from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    DUCKDB_FILE,
)

logger = logging.getLogger(__name__)


# join geojson avec la table de ana_resultats_communes generated in _dbt
def join_geojson_with_ana_resultats_communes(geojson_path: str):
    data_connection = duckdb.connect(DUCKDB_FILE)
    logger.info("Fetching commune results from database")
    results_df = data_connection.sql("SELECT * FROM ana__resultats_communes").df()
    output_path = os.path.join(
        CACHE_FOLDER, "new-georef-france-commune-prelevement.geojson"
    )

    logger.info(f"✅ new-GeoJSON processed and stored at: {output_path}")

    # Load GeoJSON
    with open(geojson_path, "r") as f:
        data_geo = json.load(f)

    # Process features
    data_geo_features = data_geo["features"]
    # Create lookup dict for faster processing
    results_lookup = (
        results_df.groupby("commune_code_insee")
        .apply(lambda x: {row["annee"]: row["resultat_cvm"] for _, row in x.iterrows()})
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
