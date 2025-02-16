"""
Download database from S3 storage.

Args:
    - env (str): Environment to download from ("dev" or "prod")

Examples:
    - download_database --env prod : Download database from production environment
    - download_database --env dev  : Download database from development environment
"""

import logging

from pipelines.config.config import get_s3_path
from pipelines.tasks._common import DUCKDB_FILE
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


def download_database_from_storage(env):
    """
    Download the database from Storage Object depending on the environment
    This requires setting the correct environment variables for the Scaleway credentials
    """
    s3 = ObjectStorageClient()
    remote_s3_path = get_s3_path(env)
    local_db_path = DUCKDB_FILE

    s3.download_object(remote_s3_path, local_db_path)
    logger.info(
        f"✅ Base téléchargée depuis s3://{s3.bucket_name}/{remote_s3_path} -> {local_db_path}"
    )


def execute(env):
    download_database_from_storage(env)
