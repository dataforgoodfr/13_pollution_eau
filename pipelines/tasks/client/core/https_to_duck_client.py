from abc import ABC, abstractmethod

from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.tasks.client.core.https_client import HTTPSClient
from pipelines.tasks.config.common import (
    logger,
)


class HTTPSToDuckDBClient(HTTPSClient, ABC):
    def __init__(self, config, duckdb_client: DuckDBClient):
        super().__init__(config["source"]["base_url"])
        self.config = config
        self.duckdb_client = duckdb_client

    def process_datasets(self):
        logger.info(f"Processing {self.__class__.__name__} data")
        self._download_data()
        self._ingest_to_duckdb()
        logger.info(f"Finishing processing {self.__class__.__name__} data")

    @abstractmethod
    def _download_data(self):
        """Download data - to be implemented by subclasses"""
        pass

    @abstractmethod
    def _ingest_to_duckdb(self):
        """Ingest data to DuckDB - to be implemented by subclasses"""
        pass
