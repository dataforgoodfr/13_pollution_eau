"""
Consolidate data into the database.

Args:
    - refresh-type (str): Type of refresh to perform ("all", "last", or "custom")
    - custom-years (str): List of years to process when refresh_type is "custom"

Examples:
    - build_database --refresh-type all : Process all years
    - build_database --refresh-type on_change : Process only years whose data has been modified from the source
    - build_database --refresh-type last : Process last year only
    - build_database --refresh-type custom --custom-years 2018,2024 : Process only the years 2018 and 2024
    - build_database --refresh-type last --drop-tables : Drop tables and process last year only
"""

import logging
import os
from datetime import datetime
from typing import List, Literal
from zipfile import ZipFile

import duckdb
import requests

from ._common import CACHE_FOLDER, DUCKDB_FILE, clear_cache
from ._config_edc import create_edc_yearly_filename, get_edc_config
from pipelines.utils.utils import extract_dataset_datetime
from tqdm import tqdm

logger = logging.getLogger(__name__)
edc_config = get_edc_config()


def check_table_existence(conn: duckdb.DuckDBPyConnection, table_name: str) -> bool:
    """
    Check if a table exists in the duckdb database
    :param conn: The duckdb connection to use
    :param table_name: The table name to check existence
    :return: True if the table exists, False if not
    """
    query = """
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_name = ?
        """
    conn.execute(query, (table_name,))
    return list(conn.fetchone())[0] == 1


def download_extract_insert_yearly_edc_data(year: str):
    """
    Downloads from www.data.gouv.fr the EDC (Eau distribuée par commune) dataset for one year,
    extracts the files and insert the data into duckdb
    :param year: The year from which we want to download the dataset
    :return: Create or replace the associated tables in the duckcb database.
        It adds the column "de_partition" based on year as an integer.
    """
    # Dataset specific constants
    DATA_URL = (
        edc_config["source"]["base_url"]
        + edc_config["source"]["yearly_files_infos"][year]["id"]
    )
    ZIP_FILE = os.path.join(
        CACHE_FOLDER, edc_config["source"]["yearly_files_infos"][year]["zipfile"]
    )
    EXTRACT_FOLDER = os.path.join(CACHE_FOLDER, f"raw_data_{year}")
    FILES = edc_config["files"]

    logger.info(f"Processing EDC dataset for {year}...")

    dataset_datetime = extract_dataset_datetime(DATA_URL)
    logger.info(f"   EDC dataset datetime: {dataset_datetime}")

    response = requests.get(DATA_URL, stream=True)
    response_size = int(response.headers.get("content-length", 0))
    # common style for the progressbar dans cli
    tqdm_common = {
        "ncols": 100,
        "bar_format": "{l_bar}{bar}| {n_fmt}/{total_fmt}",
    }

    # Open the ZIP file for writing
    with open(ZIP_FILE, "wb") as f:
        with tqdm(
            total=response_size,
            unit="B",
            unit_scale=True,
            desc="Processing",
            **tqdm_common,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                pbar.update(len(chunk))

    logger.info("   Extracting files...")
    with ZipFile(ZIP_FILE, "r") as zip_ref:
        file_list = zip_ref.namelist()
        with tqdm(
            total=len(file_list), unit="file", desc="Extracting", **tqdm_common
        ) as pbar:
            for file in file_list:
                zip_ref.extract(file, EXTRACT_FOLDER)  # Extract each file
                pbar.update(1)

    logger.info("   Creating or updating tables in the database...")
    conn = duckdb.connect(DUCKDB_FILE)

    total_operations = len(FILES)
    with tqdm(
        total=total_operations, unit="operation", desc="Handling", **tqdm_common
    ) as pbar:
        for file_info in FILES.values():
            filepath = os.path.join(
                EXTRACT_FOLDER,
                create_edc_yearly_filename(
                    file_name_prefix=file_info["file_name_prefix"],
                    file_extension=file_info["file_extension"],
                    year=year,
                ),
            )

        if check_table_existence(conn=conn, table_name=file_info["table_name"]):
            query = f"""
                DELETE FROM {file_info["table_name"]}
                WHERE de_partition = CAST(? AS INTEGER)
                ;
            """
            conn.execute(query, (year,))
            query_start = f"INSERT INTO {file_info['table_name']} "

        else:
            query_start = f"CREATE TABLE {file_info['table_name']} AS "

        query_select = """
            SELECT
                *,
                CAST(? AS INTEGER)      AS de_partition,
                current_date            AS de_ingestion_date,
                ?                       AS de_dataset_datetime
            FROM read_csv(?, header=true, delim=',');
        """

        conn.execute(query_start + query_select, (year, dataset_datetime, filepath))

    conn.close()

    logger.info("   Cleaning up cache...")
    clear_cache()

    return True


def drop_edc_tables():
    """Drop tables using tables names defined in _config_edc.py"""
    conn = duckdb.connect(DUCKDB_FILE)
    tables_names = [
        file_info["table_name"] for file_info in edc_config["files"].values()
    ]
    for table_name in tables_names:
        query = f"DROP TABLE IF EXISTS {table_name};"
        logger.info(f"Drop table {table_name} (query: {query})")
        conn.execute(query)
    return True


def get_edc_dataset_years_to_update() -> List:
    """
    Return the list of EDC dataset's years that are no longer up to date
    compared to the site www.data.gouv.fr
    """
    available_years = edc_config["source"]["available_years"]
    update_years = []

    logger.info("Check that EDC dataset are up to date according to www.data.gouv.fr")

    for year in available_years:
        data_url = (
            edc_config["source"]["base_url"]
            + edc_config["source"]["yearly_files_infos"][year]["id"]
        )
        logger.info(f"   Check EDC dataset datetime for {year}")

        conn = duckdb.connect(DUCKDB_FILE)

        files = edc_config["files"]

        for file_info in files.values():
            if check_table_existence(
                conn=conn, table_name=f"{file_info['table_name']}"
            ):
                query = f"""
                    SELECT de_dataset_datetime
                    FROM {file_info["table_name"]}
                    WHERE de_partition = CAST(? as INTEGER)
                    ;
                """
                conn.execute(query, (year,))
                current_dataset_datetime = conn.fetchone()[0]
                logger.info(
                    f"   Database - EDC dataset datetime: {current_dataset_datetime}"
                )

                format_str = "%Y%m%d-%H%M%S"
                last_data_gouv_dataset_datetime = extract_dataset_datetime(data_url)
                logger.info(
                    f"   Datagouv - EDC dataset datetime: "
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
                # EDC table will be created with process_edc_datasets
                update_years.append(year)
            # Only one check of a file is needed because the update is done for the whole
            break

    if update_years:
        logger.info(f"   EDC dataset update is necessary for {update_years}")
    else:
        logger.info("   All EDC dataset are already up to date")
    return update_years


def process_edc_datasets(
    refresh_type: Literal["all", "on_change", "last", "custom"] = "last",
    custom_years: List[str] = None,
    drop_tables: bool = False,
):
    """
    Process the EDC datasets.
    :param refresh_type: Refresh type to run
        - "all": Drop edc tables and import the data for every possible year.
        - "on_change": Refresh only changed data from source
        - "last": Refresh the data only for the last available year
        - "custom": Refresh the data for the years specified in the list custom_years
    :param custom_years: years to update
    :param drop_tables: Whether to drop edc tables in the database before data insertion.
    :return:
    """
    available_years = edc_config["source"]["available_years"]

    if refresh_type == "all":
        years_to_update = available_years
    elif refresh_type == "on_change":
        years_to_update = get_edc_dataset_years_to_update()
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

    logger.info(f"Launching processing of EDC datasets for years: {years_to_update}")

    if drop_tables or (refresh_type == "all"):
        drop_edc_tables()

    for year in years_to_update:
        download_extract_insert_yearly_edc_data(year=year)

    logger.info("Cleaning up cache...")
    clear_cache(recreate_folder=False)
    return True


def execute(
    refresh_type: str = "all",
    custom_years: List[str] = None,
    drop_tables: bool = False,
):
    """
    Execute the EDC dataset processing with specified parameters.

    :param refresh_type: Type of refresh to perform ("all", "on_change", last", or "custom")
    :param custom_years: List of years to process when refresh_type is "custom"
    :param drop_tables: Whether to drop edc tables in the database before data insertion.
    """
    # Build database
    process_edc_datasets(
        refresh_type=refresh_type, custom_years=custom_years, drop_tables=drop_tables
    )
