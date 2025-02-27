import logging
from pathlib import Path
from urllib.parse import urlparse

import requests


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
