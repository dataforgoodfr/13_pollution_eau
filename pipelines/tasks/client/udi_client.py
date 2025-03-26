import os
from pathlib import Path

from pipelines.tasks.client.core.https_to_duck_client import HTTPSToDuckDBClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    logger,
)


class UDIClient(HTTPSToDuckDBClient):
    def __init__(self, config, duckdb_client):
        super().__init__(config, duckdb_client)

    def _download_data(self):
        logger.info("Launching download_data from s3")
        os.makedirs(CACHE_FOLDER, exist_ok=True)
        self.download_file_from_https(
            path=self.config["source"]["id"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )

    def _ingest_to_duckdb(self):
        logger.info("DB ingest geojson data")
        self.duckdb_client.drop_tables(table_names=[self.config["file"]["table_name"]])
        self.duckdb_client.ingest_from_geojson(
            table_name=self.config["file"]["table_name"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )
        logger.info("✅ geojson file has been ingested in DB")
