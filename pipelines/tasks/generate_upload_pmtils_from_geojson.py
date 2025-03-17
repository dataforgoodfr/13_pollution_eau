import logging
import os

from pipelines.config.config import get_environment, get_s3_path

# from pipelines.tasks.config.config_geojson import get_opendatasoft_config
from pipelines.tasks.geospatial_processors import geojson_to_pmtiles_converter
from pipelines.utils.storage_client import ObjectStorageClient
from tasks.client.opendatasoft_client import OpenDataSoftClient
from tasks.config.common import CACHE_FOLDER, DUCKDB_FILE
from tasks.geojson_processor import GeoJSONProcessor

logger = logging.getLogger(__name__)

"""tasks:
    - get geojson file from source,
    - generate new_geojson and store in local cache,
    - transform new_geojson into pmtiles
    - upload pmtils to S3
"""


def generate_upload_pmtils_from_geojson(
    env,
    sourcedata_client: OpenDataSoftClient,
    geojson_processor: GeoJSONProcessor | None,
    s3_client: ObjectStorageClient,
    geojson_file_name: str,
    pmtiles_file_name: str,
):
    logger.info(f"Running on env {env}")

    logger.info("Starting GeoJSON generation process")

    # Download GeoJSON
    # geojson_path = os.path.join(CACHE_FOLDER, "georef-france-commune.geojson")
    geojson_path = os.path.join(CACHE_FOLDER, geojson_file_name)
    logger.info("Downloading GeoJSON")
    sourcedata_client.download_geojson(output_path=geojson_path)

    # process geojson if geojson_processor exist, otherwise skip this step
    if geojson_processor:
        geojson_path = geojson_processor(geojson_path=geojson_path)
    # convert generated geojson to france-commune-prelevement.pmtiles
    # pmtiles_path = os.path.join(CACHE_FOLDER, "france-commune-prelevement.pmtiles")
    pmtiles_path = os.path.join(CACHE_FOLDER, pmtiles_file_name)
    geojson_to_pmtiles_converter(geojson_path, pmtiles_path)

    logger.info(f"Uploading {pmtiles_file_name} to S3")
    pmtiles_s3_path = get_s3_path(env, "pmtiles", pmtiles_file_name)
    s3_client.upload_object(
        local_path=pmtiles_path, file_key=pmtiles_s3_path, public_read=True
    )
    url = f"https://{s3_client.bucket_name}.{s3_client.endpoint_url.split('https://')[1]}/{pmtiles_s3_path}"
    logger.info(f"✅ public url: {url}")
