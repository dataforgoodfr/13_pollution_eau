"""Generate and upload merged new PMtiles file.
For both UDI and communes data:
- Get geom data from duck db
- Get prelevement results from duckdb, merge with geom, convert to pmtiles and uploads the new Pmtiles to S3.

Args:
    - env (str): Environment to download from ("dev" or "prod")
"""

import json
import os

from tasks.config.common import CACHE_FOLDER

from pipelines.tasks.client.geojson_processor import GeoJSONProcessor
from pipelines.tasks.client.pmtiles_processor import PmtilesProcessor
from pipelines.utils.logger import get_logger

logger = get_logger(__name__)


def execute(env: str):
    """
    Execute GeoJSON generation and upload process.

    Args:
        env: Environment to use ("dev" or "prod")
    """
    generate_pmtiles(env, "communes")


def generate_pmtiles(env, type):
    logger.info("Starting GeoJSON generation process")

    # Initialize clients
    geojson_processor = GeoJSONProcessor(type)
    pmtiles_processor = PmtilesProcessor(type)

    # Process and merge data
    logger.info(f"Merging GeoJSON with {type} results")
    geojson_output_path = os.path.join(
        CACHE_FOLDER, f"new-georef-france-{type}-prelevement.geojson"
    )
    geojson = geojson_processor.generate_geojson()

    with open(geojson_output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f)

    logger.info(f"✅ GeoJSON processed and stored at: {geojson_output_path}")

    logger.info("Convert new-GeoJSON to pmtiles")
    pmtils_output_path = os.path.join(
        CACHE_FOLDER, f"georef-france-{type}-prelevement.pmtiles"
    )
    pmtiles_processor.convert_geojson_to_pmtiles(
        geojson_output_path, pmtils_output_path, f"data_{type}"
    )

    logger.info("Uploading pmtiles to S3")
    url = pmtiles_processor.upload_pmtils_to_storage(
        env, pmtils_path=pmtils_output_path
    )
    logger.info(f"pmtiles s3 pubic Url: {url}")
