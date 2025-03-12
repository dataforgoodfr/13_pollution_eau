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
from pipelines.config.config import get_s3_path_geojson
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


def upload_geojson_to_storage(env: str, geojson_path: str):
    """
    Upload the GeoJSON file to Storage Object depending on the environment
    This requires setting the correct environment variables for the Scaleway credentials
    """
    s3 = ObjectStorageClient()
    s3_path = get_s3_path_geojson(env)

    s3.upload_object(local_path=geojson_path, file_key=s3_path, public_read=True)
    logger.info(f"✅ GeoJSON uploaded to s3://{s3.bucket_name}/{s3_path}")


def execute(env: str, geojson_path: str):
    upload_geojson_to_storage(env, geojson_path)
