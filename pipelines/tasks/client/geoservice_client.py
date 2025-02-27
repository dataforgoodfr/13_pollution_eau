import os
from pathlib import Path

import geopandas as gpd

from pipelines.tasks.client.duckdb_client import DuckDBClient
from pipelines.tasks.client.https_client import HTTPSClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    clear_cache,
    extract_file_7zip,
    logger,
)


class GeoServiceClient(HTTPSClient):
    """
    Recuperer la tracé de commune via
    le GeoService.irig_ge https://geoservices.irig_ge.fr/irisge
    url de ficher telecharge: https://data.geopf.fr/telechargement/download/IRIS-GE/IRIS-GE_3-0__SHP_LAMB93_FXX_2024-01-01/IRIS-GE_3-0__SHP_LAMB93_FXX_2024-01-01.7z
    """

    def __init__(self, config):
        super().__init__(config["source"]["base_url"])
        self.config = config

    def download_extract_datasets(self):
        logger.info("Download GeoService datasets")
        zip_filepath = Path(CACHE_FOLDER, self.config["file"]["zip_name"])

        self.download_file_from_https(
            path=self.config["file"]["file_key"]
            + "/"
            + self.config["file"]["zip_name"],
            filepath=zip_filepath,
        )
        logger.info("Extract irig_ge 7zip")
        extract_file_7zip(zip_file=zip_filepath, extract_folder=CACHE_FOLDER)

    def process_datasets(self):
        logger.info("Launching processing of geoservice irisge datasets")
        self.download_extract_datasets()
        iris_ge_path = Path(
            CACHE_FOLDER,
            self.config["file"]["middle_path"],
            self.config["file"]["file_name"],
        )
        # lecture shapefile iris_ge
        gpd_file = gpd.read_file(iris_ge_path)

        # duckdb ne peut pas accepter le geometry de gpd, convertir en format WKT
        gpd_file["GEOM"] = gpd_file["geometry"].apply(lambda geom: geom.wkt)
        gpd_file = gpd_file.drop(columns="geometry")
        duckdb_client = DuckDBClient()
        duckdb_client.drop_tables(table_names=[self.config["file"]["table_name"]])
        duckdb_client.ingest_from_geopanda(
            df=gpd_file, table_name=self.config["file"]["table_name"]
        )
        clear_cache(recreate_folder=False)
