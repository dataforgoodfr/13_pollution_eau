import os
from pathlib import Path

from pipelines.tasks.client.duckdb_client import DuckDBClient
from pipelines.tasks.client.https_client import HTTPSClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    logger,
)


class HTTPSToDuckDBClient(HTTPSClient):
    def __init__(self, config):
        super().__init__(config["source"]["base_url"])
        self.config = config

    def process_datasets(self):
        """Process the COG datasets"""
        # Process data
        logger.info("Launching processing of Insee communes")

        os.makedirs(CACHE_FOLDER, exist_ok=True)
        self.download_file_from_https(
            path=self.config["source"]["id"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )

        # create table in the database
        duckdb_client = DuckDBClient()
        duckdb_client.drop_tables(table_names=[self.config["file"]["table_name"]])
        duckdb_client.ingest_from_csv(
            ingest_type="CREATE",
            table_name=self.config["file"]["table_name"],
            de_partition=self.config["source"]["datetime"][:4],
            dataset_datetime=self.config["source"]["datetime"],
            filepath=Path(CACHE_FOLDER, self.config["file"]["file_name"]),
        )
        # duckdb_client.close()
