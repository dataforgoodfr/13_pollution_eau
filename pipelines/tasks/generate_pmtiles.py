"""Generate and upload merged new PMtiles file.

Downloads commune GeoJSON data from OpenDataSoft, merges it with
ana__resultats_communes from duckdb, convert to pmtiles and uploads the
new Pmtiles to S3.
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

    logger.info("Starting GeoJSON generation process")

    # Initialize clients
    geojson_processor = GeoJSONProcessor("communes")
    pmtiles_processor = PmtilesProcessor()

    # Process and merge data
    logger.info("Merging GeoJSON with commune results")
    geojson_output_path = os.path.join(
        CACHE_FOLDER, "new-georef-france-commune-prelevement.geojson"
    )
    geojson = geojson_processor.generate_geojson()

    with open(geojson_output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f)

    logger.info(f"✅ GeoJSON processed and stored at: {geojson_output_path}")

    logger.info("Convert new-GeoJSON to pmtiles")
    pmtils_output_path = os.path.join(
        CACHE_FOLDER, "georef-france-commune-prelevement.pmtiles"
    )
    pmtiles_processor.convert_geojson_to_pmtiles(
        geojson_output_path, pmtils_output_path, "datacommunes"
    )

    logger.info("Uploading pmtiles to S3")
    url = pmtiles_processor.upload_pmtils_to_storage(
        env, pmtils_path=pmtils_output_path
    )
    logger.info(f"pmtiles s3 pubic Url: {url}")
