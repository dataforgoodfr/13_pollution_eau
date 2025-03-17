"""
Upload GeoJSON to S3 storage.

Args:
    - env (str): Environment to upload to ("dev" or "prod")
    - geojson_path (str): Local path to the GeoJSON file

Examples:
    - upload_geojson --env dev  : Upload GeoJSON to development environment
    - upload_geojson --env prod : Upload GeoJSON to production environment
"""

import logging
import os

import duckdb

from pipelines.config.config import get_environment, get_s3_path
from pipelines.tasks.config.config_geojson import get_opendatasoft_config
from pipelines.utils.convert_geojson_pmtiles import convert_geojson_to_pmtiles
from pipelines.utils.storage_client import ObjectStorageClient
from tasks.client.opendatasoft_client import OpenDataSoftClient
from tasks.config.common import CACHE_FOLDER, DUCKDB_FILE
from tasks.geojson_processor import GeoJSONProcessor

logger = logging.getLogger(__name__)


def generate_upload_geojson_pmtils(env):
    """Generate and upload merged new GeoJSON file. Transformer le GeoJSON en pmtils
    Downloads commune GeoJSON data from OpenDataSoft merges it with
    ana__resultats_communes from duckdb, and uploads the
    new GeoJSON to S3.
    Convertir GeoJSON data to pmtils and upload to S3
    """

    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="dev")
    logger.info(f"Running on env {env}")

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

    # convert generated geojson to france-commune-prelevement.pmtiles
    pmtiles_path = os.path.join(CACHE_FOLDER, "france-commune-prelevement.pmtiles")
    convert_geojson_to_pmtiles(output_path, pmtiles_path)

    s3 = ObjectStorageClient()
    logger.info("Uploading france-commune-prelevement.pmtiles to S3")
    # pmtiles_path_s3_path = get_s3_path(env, "pmtiles", "france-commune.pmtiles")
    pmtiles_s3_path = get_s3_path(env, "pmtiles", "france-commune-prelevement.pmtiles")
    # s3.upload_object(local_path=geojson_path, file_key=geson_s3_path, public_read=True)
    s3.upload_object(
        local_path=pmtiles_path, file_key=pmtiles_s3_path, public_read=True
    )
    url = f"https://{s3.bucket_name}.{s3.endpoint_url.split('https://')[1]}/{pmtiles_s3_path}"
    logger.info(f"✅ public url: {url}")


def execute(env):
    generate_upload_geojson_pmtils(env)
