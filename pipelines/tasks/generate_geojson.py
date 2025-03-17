"""Generate and upload merged new GeoJSON file.

Downloads commune GeoJSON data from OpenDataSoft, merges it with
ana__resultats_communes from duckdb, and uploads the
new GeoJSON to S3.
"""

import logging
import os

import duckdb

from pipelines.tasks.config.config_geojson import get_opendatasoft_config
from tasks.client.opendatasoft_client import OpenDataSoftClient
from tasks.config.common import CACHE_FOLDER, DUCKDB_FILE
from tasks.geojson_processor import GeoJSONProcessor
from tasks.upload_geojson import execute as upload_geojson

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
    processor = GeoJSONProcessor()

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
    output_path = os.path.join(
        CACHE_FOLDER, "new-georef-france-commune-prelevement.geojson"
    )
    processor.merge_geojson_with_results(
        geojson_path=geojson_path, results_df=results_df, output_path=output_path
    )

    logger.info(f"✅ new-GeoJSON processed and stored at: {output_path}")

    # Upload to S3
    logger.info("Uploading merged GeoJSON to S3")
    upload_geojson(env, output_path)
