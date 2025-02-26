import logging
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import duckdb
import requests

from pipelines.tasks.config.common import DUCKDB_FILE
from pipelines.tasks.config.config_edc import get_edc_config

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """
    Returns project root folder when called from anywhere in the project
    This is useful for specifying paths that are relative to the project root
    e.g. `local_db_path = Path(get_project_root(), "database/data.duckdb")`
    """
    return Path(__file__).parent.parent.parent


def get_url_headers(url: str) -> dict:
    """
    Get url HTTP headers
    :param url: static dataset url
    :return: HTTP headers
    """
    try:
        response = requests.head(url, timeout=5)
        response.raise_for_status()
        return response.headers
    except requests.exceptions.RequestException as ex:
        logger.error(f"Exception raised: {ex}")
        return {}


def extract_dataset_datetime(url: str) -> str:
    """
    Extract the dataset datetime from dataset location url
    which can be found in the static dataset url headers
    :param url: static dataset url
    :return: dataset datetime under format "YYYYMMDD-HHMMSS"
    """
    metadata = get_url_headers(url)
    parsed_url = urlparse(metadata.get("location"))
    path_parts = parsed_url.path.strip("/").split("/")
    return path_parts[-2]


def get_edc_dataset_years_to_update(years: list) -> list:
    """
    Return the list of EDC dataset's years that are no longer up to date
    compared to the site www.data.gouv.fr
    :param years: list of years to check
    :return: list of years that are no longer up to date
    """
    update_years = []

    logger.info("Check that EDC dataset are up to date according to www.data.gouv.fr")

    conn = duckdb.connect(DUCKDB_FILE)

    for year in years:
        logger.info(f"   Check EDC dataset datetime for {year}")

        edc_config = get_edc_config()
        data_url = (
            edc_config["source"]["base_url"]
            + edc_config["source"]["yearly_files_infos"][year]["id"]
        )
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
                    last_data_gouv_dataset_datetime = extract_dataset_datetime(data_url)
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

    conn.close()
    return update_years
