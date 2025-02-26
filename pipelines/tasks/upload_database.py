"""
Upload database to S3 storage.

Args:
    - env (str): Environment to upload to ("dev" or "prod")

Examples:
    - upload_database --env dev  : Upload database to development environment
    - upload_database --env prod : Upload database to production environment
"""

import logging

from pipelines.config.config import get_s3_path
from pipelines.tasks.config.common import DUCKDB_FILE
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


def upload_database_to_storage(env):
    """
    Upload the database built locally to Storage Object depending on the environment
    This requires setting the correct environment variables for the Scaleway credentials
    """
    s3 = ObjectStorageClient()

    db_path = DUCKDB_FILE  # Fichier local
    s3_path = get_s3_path(env)  # Destination sur S3

    s3.upload_object(local_path=db_path, file_key=s3_path, public_read=True)
    logger.info(f"✅ Base uploadée sur s3://{s3.bucket_name}/{s3_path}")


def execute(env):
    upload_database_to_storage(env)
