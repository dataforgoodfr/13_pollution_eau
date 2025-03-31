import os
from pathlib import Path

from pipelines.tasks.client.core.https_to_duck_client import HTTPSToDuckDBClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    logger,
)


class CommuneClient(HTTPSToDuckDBClient):
    def __init__(self, config, duckdb_client):
        super().__init__(config, duckdb_client)

    def _download_data(self):
        """Process the COG datasets"""
        logger.info("Launching processing of Insee communes")

        os.makedirs(CACHE_FOLDER, exist_ok=True)
        self.download_file_from_https(
            path=self.config["source"]["id"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )

    def _ingest_to_duckdb(self):
        """Implement INSEE specific ingestion logic"""
        self.duckdb_client.drop_tables([self.config["file"]["table_name"]])
        self.duckdb_client.ingest_from_csv(
            ingest_type="CREATE",
            table_name=self.config["file"]["table_name"],
            de_partition=self.config["source"]["datetime"][:4],
            dataset_datetime=self.config["source"]["datetime"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )
