import logging

from pipelines.config.config import get_environment, get_s3_path
from pipelines.tasks._common import DUCKDB_FILE
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


def download_database_from_storage():
    """
    Download the database from Storage Object depending on the environment
    This requires setting the correct environment variables for the Scaleway credentials
    """
    s3 = ObjectStorageClient()

    env = get_environment(default="prod")
    remote_s3_path = get_s3_path(env)
    local_db_path = DUCKDB_FILE

    s3.download_object(remote_s3_path, local_db_path)
    logger.info(
        f"✅ Base téléchargée depuis s3://{s3.bucket_name}/{remote_s3_path} -> {local_db_path}"
    )


def execute():
    download_database_from_storage()
