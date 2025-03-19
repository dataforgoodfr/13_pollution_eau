import logging
from pathlib import Path

from pipelines.config.config import get_environment, get_s3_udi_path
from pipelines.tasks.client.duckdb_client import DuckDBClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
)
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


class UDI_Processor:
    def __init__(self, config):
        self.s3 = ObjectStorageClient()
        self.config = config

    def process_geojson_to_database(self):
        try:
            logger.info("Launching processing of s3 geojson")
            geojson_file_name = self.config["source"]["id"]
            local_path = Path(CACHE_FOLDER, geojson_file_name)
            env = get_environment(default="dev")
            s3_path = get_s3_udi_path(env, geojson_file_name)
            self.s3.download_object(s3_path, local_path)

            logger.info("DB ingest geojson data")
            duckdb_client = DuckDBClient()
            duckdb_client.drop_tables(table_names=[self.config["file"]["table_name"]])
            duckdb_client.ingest_from_geojson(str(local_path), "metropole_udi")
            logger.info("✅ geojson file has been ingested in DB")

        except Exception as e:
            logger.error(e)
