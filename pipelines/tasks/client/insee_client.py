from pathlib import Path

from pipelines.tasks.client.duckdb_client import DuckDBClient
from pipelines.tasks.client.https_client import HTTPSClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    logger,
)
from pipelines.tasks.config.config_insee import get_insee_config


class InseeClient(HTTPSClient):
    def __init__(
        self, base_url="https://www.insee.fr/fr/statistiques/fichier/7766585/"
    ):
        super().__init__(base_url)
        self.config = get_insee_config()

    def process_datasets(self):
        """Process the COG datasets"""
        # Process data
        logger.info("Launching processing of Insee communes")

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
