"""Generate and upload merged new GeoJSON file.

Downloads commune GeoJSON data from OpenDataSoft, merges it with
ana__resultats_communes from duckdb, and uploads the
new GeoJSON to S3.
"""

import logging
import os

import duckdb

from pipelines.tasks.client.geojson_processor import GeoJSONProcessor
from pipelines.tasks.client.pmtiles_processor import PmtilesProcessor
from pipelines.tasks.config.config_geojson import get_opendatasoft_config
from tasks.client.opendatasoft_client import OpenDataSoftClient
from tasks.config.common import CACHE_FOLDER, DUCKDB_FILE

logger = logging.getLogger(__name__)


def execute(env: str):
    """
    Execute GeoJSON generation and upload process.

    Args:
        env: Environment to use ("dev" or "prod")
    """

    logger.info("Starting GeoJSON generation process")

    # Initialize clients
    opendatasoft = OpenDataSoftClient(config=get_opendatasoft_config())
    geojson_processor = GeoJSONProcessor()
    pmtiles_processor = PmtilesProcessor()

    # Download GeoJSON
    geojson_path = os.path.join(CACHE_FOLDER, "georef-france-commune.geojson")
    logger.info("Downloading GeoJSON from OpenDataSoft")
    opendatasoft.download_geojson(output_path=geojson_path)

    # Get results from database
    logger.info("Fetching commune results from database")
    with duckdb.connect(DUCKDB_FILE, read_only=True) as con:
        results_df = con.sql("SELECT * FROM ana__resultats_communes").df()

    # Process and merge data
    logger.info("Merging GeoJSON with commune results")
    geojson_output_path = os.path.join(
        CACHE_FOLDER, "new-georef-france-commune-prelevement.geojson"
    )
    geojson_processor.merge_geojson_with_results(
        geojson_path=geojson_path,
        results_df=results_df,
        output_path=geojson_output_path,
    )
    logger.info(f"✅ new-GeoJSON processed and stored at: {geojson_output_path}")

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
    logger.info("pmtiles s3 pubic Url: ", url)
