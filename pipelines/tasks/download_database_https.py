"""
Download database from HTTP Scaleway object storage public link.

Args:
    - env (str): Environment to download from ("dev" or "prod")

Examples:
    - download_database_https --env prod : Download database from production environment
    - download_database_https --env dev  : Download database from development environment
"""

import logging

from pipelines.config.config import get_s3_path
from pipelines.tasks._common import DUCKDB_FILE
from pipelines.utils.storage_client import ObjectStorageClient
from ._common import download_file_from_https

logger = logging.getLogger(__name__)


def download_database_from_https(env):
    """
    Download the database from Storage Object depending on the environment
    This requires setting the correct environment variables for the Scaleway credentials
    """
    s3 = ObjectStorageClient()
    url = f"https://{s3.bucket_name}.{s3.endpoint_url.split('https://')[1]}/{get_s3_path(env)}"
    local_db_path = DUCKDB_FILE

    download_file_from_https(url=url, filepath=local_db_path)
    logger.info(f"✅ Base téléchargée depuis s3 via HTTPS: {url} -> {local_db_path}")


def execute(env):
    download_database_from_https(env)
