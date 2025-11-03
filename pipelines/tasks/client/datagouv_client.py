import os
import re
from datetime import datetime
from pathlib import Path
from typing import List, Literal, Union
from urllib.parse import urlparse

from tqdm import tqdm

from pipelines.tasks.client.core.https_client import HTTPSClient
from pipelines.tasks.config.common import (
    CACHE_FOLDER,
    clear_cache,
    extract_file,
    logger,
    tqdm_common,
)
from pipelines.tasks.config.config_edc import get_edc_config


class DataGouvClient(HTTPSClient):
    """
    Data come from the source at this url https://www.data.gouv.fr/fr/datasets/resultats-du-controle-sanitaire-de-leau-distribuee-commune-par-commune/
    """

    def __init__(self, duckdb_client, base_url: str = "https://www.data.gouv.fr/"):
        super().__init__(base_url)
        self.base_url = base_url
        self.datasets_path = "api/1/datasets/r/"
        self.duckdb_client = duckdb_client
        self.config_edc = get_edc_config()

    def _extract_dataset_datetime(self, dataset_id: str) -> str:
        """
        Extract the dataset datetime by reading the HTTP headers of the dataset URL
        and parsing the 'location' header to find the timestamp.

        The function makes a request to get the URL headers, extracts the 'location' header
        (which contains the redirect URL), and searches for the datetime pattern in the URL path.

        Example location header value:
        https://static.data.gouv.fr/resources/resultats-du-controle-sanitaire-de-leau-distribuee-commune-par-commune/20230811-150005/dis-2020.zip

        :param dataset_id: dataset id to fetch
        :return: dataset datetime under format "YYYYMMDD-HHMMSS"
        """
        metadata = self.get_url_headers(self.base_url + self.datasets_path + dataset_id)
        location = metadata.get("location", "")

        # Ensure location is a string
        if isinstance(location, bytes):
            location = location.decode("utf-8")

        parsed_url = urlparse(location)
        # Ensure path is a string
        path = parsed_url.path
        if isinstance(path, bytes):
            path = path.decode("utf-8")

        path_parts = path.strip("/").split("/")

        # Log debug information to help diagnose the issue
        logger.debug(f"Location URL: {location}")
        logger.debug(f"Path parts: {path_parts}")

        # Try to find the datetime pattern in the path parts
        # Expected format: YYYYMMDD-HHMMSS
        datetime_pattern = re.compile(r"^\d{8}-\d{6}$")

        for part in path_parts:
            if datetime_pattern.match(part):
                return part

        # If no datetime found, raise an error with diagnostic info
        raise ValueError(
            f"Could not extract dataset datetime from URL: {location}\n"
            f"Path parts: {path_parts}\n"
            f"Expected datetime format YYYYMMDD-HHMMSS not found in any path segment"
        )

    def download_dataset_to_file(self, dataset_id: str, filepath: Union[str, Path]):
        self.download_file_from_https(
            path=self.datasets_path + dataset_id, filepath=filepath
        )
        return True

    @staticmethod
    def _create_edc_yearly_filename(
        file_name_prefix: str, file_extension: str, year: str
    ) -> str:
        """
        This function is used to recreate the yearly filenames of the extracted files.
        It is intended for use with the edc_config["files"] data above.
        For example in 2024 the file name for communes should be:
            DIS_COM_UDI_2024.txt
        :param file_name_prefix: prefix of the filename
        :param file_extension: extension of the file
        :param year: year of the needed file
        :return: the yearly filename as a string
        """
        return file_name_prefix + year + file_extension

    def _get_edc_dataset_years_to_update(self, years: list) -> list:
        """
        Return the list of EDC dataset's years that are no longer up to date
        compared to the site www.data.gouv.fr
        :param years: list of years to check
        :return: list of years that are no longer up to date
        """
        update_years = []

        logger.info(
            "Check that EDC dataset are up to date according to www.data.gouv.fr"
        )

        conn = self.duckdb_client.conn

        for year in years:
            logger.info(f"   Check EDC dataset datetime for {year}")

            edc_config = self.config_edc
            files = edc_config["files"]

            for file_info in files.values():
                # Check database presence
                query = """
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_name = ?
                    ;
                    """
                conn.execute(query, (file_info["table_name"],))
                if conn.fetchone()[0] == 1:
                    # Check dataset year is present in the database
                    query = f"""
                        SELECT EXISTS (
                            SELECT 1
                            FROM {file_info["table_name"]}
                            WHERE de_partition = CAST(? as INTEGER)
                        );
                    """
                    conn.execute(query, (year,))
                    if conn.fetchone()[0]:
                        # get dataset datetime
                        query = f"""
                            SELECT de_dataset_datetime
                            FROM {file_info["table_name"]}
                            WHERE de_partition = CAST(? as INTEGER)
                            ;
                        """
                        conn.execute(query, (year,))
                        current_dataset_datetime = conn.fetchone()[0]
                        logger.info(
                            f"      Database - EDC dataset datetime: {current_dataset_datetime}"
                        )

                        format_str = "%Y%m%d-%H%M%S"
                        last_data_gouv_dataset_datetime = (
                            self._extract_dataset_datetime(
                                edc_config["source"]["yearly_files_infos"][year]["id"]
                            )
                        )
                        logger.info(
                            f"      Datagouv - EDC dataset datetime: "
                            f"{last_data_gouv_dataset_datetime}"
                        )

                        last_data_gouv_dataset_datetime = datetime.strptime(
                            last_data_gouv_dataset_datetime, format_str
                        )
                        current_dataset_datetime = datetime.strptime(
                            current_dataset_datetime, format_str
                        )

                        if last_data_gouv_dataset_datetime > current_dataset_datetime:
                            update_years.append(year)
                    else:
                        logger.info(f"      {year} doesn't exist in the database")
                        update_years.append(year)
                else:
                    # EDC table will be created with process_edc_datasets
                    logger.info("      Database doesn't exists")
                    update_years.append(year)
                # Only one check of a file is needed because the update is done for the whole
                break

        if update_years:
            logger.info(f"   EDC dataset update is necessary for {update_years}")
        else:
            logger.info("   All EDC dataset are already up to date")

        # duckdb_client.close() # this line is commented because we get error duckdb.duckdb.ConnectionException: Connection Error: Connection already closed! when it is not
        return update_years

    def process_yearly_edc_data(self, year):
        logger.info(f"Processing EDC dataset for {year}...")
        dataset_id = self.config_edc["source"]["yearly_files_infos"][year]["id"]
        dataset_datetime = self._extract_dataset_datetime(dataset_id=dataset_id)
        logger.info(f"   EDC dataset datetime: {dataset_datetime}")

        zip_file = Path(
            CACHE_FOLDER,
            self.config_edc["source"]["yearly_files_infos"][year]["zipfile"],
        )
        extract_folder = Path(CACHE_FOLDER, f"raw_data_{year}")

        self.download_dataset_to_file(dataset_id=dataset_id, filepath=zip_file)

        logger.info("   Extracting files...")

        extract_file(zip_file=zip_file, extract_folder=extract_folder)

        logger.info("   Creating or updating tables in the database...")

        files = self.config_edc["files"]

        with tqdm(
            total=len(files), unit="operation", desc="Handling", **tqdm_common
        ) as pbar:
            for file_info in files.values():
                filepath = os.path.join(
                    extract_folder,
                    self._create_edc_yearly_filename(
                        file_name_prefix=file_info["file_name_prefix"],
                        file_extension=file_info["file_extension"],
                        year=year,
                    ),
                )
                if self.duckdb_client.check_table_existence(
                    table_name=file_info["table_name"]
                ):
                    self.duckdb_client.delete_from_table(
                        table_name=file_info["table_name"],
                        filters=[
                            self.duckdb_client.SQLFilters(
                                colname="de_partition",
                                filter_value=year,
                                coltype="INTEGER",
                            )
                        ],
                    )

                    ingest_type = "INSERT"

                else:
                    ingest_type = "CREATE"

                self.duckdb_client.ingest_from_csv(
                    ingest_type=ingest_type,
                    table_name=file_info["table_name"],
                    de_partition=year,
                    dataset_datetime=dataset_datetime,
                    filepath=filepath,
                )
                pbar.update(1)
        logger.info("   Cleaning up cache...")
        clear_cache()

    def process_edc_datasets(
        self,
        refresh_type: Literal["all", "last", "custom"] = "last",
        custom_years: List[str] = [],
        drop_tables: bool = False,
        check_update: bool = False,
    ):
        """
        Process the EDC datasets.
        :param refresh_type: Refresh type to run
            - "all": Drop edc tables and import the data for every possible year.
            - "last": Refresh the data only for the last available year
            - "custom": Refresh the data for the years specified in the list custom_years
        :param custom_years: years to update
        :param drop_tables: Whether to drop edc tables in the database before data insertion.
        :param check_update: Whether to process only whose data has been modified from the source
        :return:
        """
        available_years = self.config_edc["source"]["available_years"]

        if refresh_type == "all":
            years_to_update = available_years
        elif refresh_type == "last":
            years_to_update = available_years[-1:]
        elif refresh_type == "custom":
            if custom_years:
                # Check if every year provided are available
                invalid_years = set(custom_years) - set(available_years)
                if invalid_years:
                    raise ValueError(
                        f"Invalid years provided: {sorted(invalid_years)}. Years must be among: {available_years}"
                    )
                # Filtering and sorting of valid years
                years_to_update = sorted(
                    list(set(custom_years).intersection(available_years))
                )
            else:
                raise ValueError(
                    """ custom_years parameter needs to be specified if refresh_type="custom" """
                )
        else:
            raise ValueError(
                f""" refresh_type needs to be one of ["all", "last", "custom"], it can't be: {refresh_type}"""
            )

        if check_update:
            years_to_update = self._get_edc_dataset_years_to_update(years_to_update)
        else:
            if drop_tables or (refresh_type == "all"):
                tables_names = [
                    file_info["table_name"]
                    for file_info in self.config_edc["files"].values()
                ]

                self.duckdb_client.drop_tables(table_names=tables_names)

        logger.info(
            f"Launching processing of EDC datasets for years: {years_to_update}"
        )

        for year in years_to_update:
            self.process_yearly_edc_data(year=year)

        logger.info("Cleaning up cache...")
        clear_cache()
        return True
