import os
from pathlib import Path

from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    logger,
)
from pipelines.utils.storage_client import ObjectStorageClient


class UploadedGeoJSONClient:
    """Client pour télécharger et ingérer plusieurs fichiers GeoJSON uploadés préalablement manuellement sur S3"""

    def __init__(self, config, duckdb_client: DuckDBClient):
        self.config = config
        self.duckdb_client = duckdb_client
        self.storage_client = ObjectStorageClient()

        if "files" not in self.config:
            raise ValueError(
                "Configuration must contain a 'files' list with the GeoJSON files to process"
            )

        self.files_config = self.config["files"]
        logger.info(
            f"UploadedGeoJSONClient initialized with {len(self.files_config)} file(s)"
        )

    def process_datasets(self):
        logger.info(f"Processing {self.__class__.__name__} data")
        self._download_data()
        self._ingest_to_duckdb()
        logger.info(f"Finishing processing {self.__class__.__name__} data")

    def _download_data(self):
        os.makedirs(CACHE_FOLDER, exist_ok=True)

        for file_config in self.files_config:
            s3_key = (
                f"{self.config['source'].get('prefix', 'upload')}/{file_config['path']}"
            )
            local_path = Path(CACHE_FOLDER, file_config["local_file_name"])
            logger.info(f"Downloading {s3_key} to {local_path}")
            self.storage_client.download_object(
                file_key=s3_key, local_path=str(local_path)
            )

    def _ingest_to_duckdb(self):
        logger.info(
            f"Ingesting {len(self.files_config)} uploaded GeoJSON file(s) into DuckDB"
        )

        # Collect all table names for dropping
        table_names = [file_config["table_name"] for file_config in self.files_config]
        self.duckdb_client.drop_tables(table_names=table_names)

        # Ingest each file
        for file_config in self.files_config:
            logger.info(
                f"Ingesting {file_config['local_file_name']} into table {file_config['table_name']}"
            )
            self.duckdb_client.ingest_from_geojson(
                table_name=file_config["table_name"],
                filepath=Path(CACHE_FOLDER, file_config["local_file_name"]),
            )
            logger.info(
                f"✅ {file_config['local_file_name']} has been ingested into table {file_config['table_name']}"
            )

        logger.info("✅ All uploaded GeoJSON files have been ingested in DB")
