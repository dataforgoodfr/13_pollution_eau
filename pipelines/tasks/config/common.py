import logging
import os
import shutil
from pathlib import Path
from typing import Union
from zipfile import ZipFile

import requests
from tqdm import tqdm

ROOT_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATABASE_FOLDER = os.path.join(ROOT_FOLDER, "database")
DUCKDB_FILE = os.path.join(DATABASE_FOLDER, "data.duckdb")
CACHE_FOLDER = os.path.join(ROOT_FOLDER, "database", "cache")

os.makedirs(CACHE_FOLDER, exist_ok=True)
os.makedirs(DATABASE_FOLDER, exist_ok=True)

logger = logging.getLogger(__name__)

# common style for the progressbar dans cli
tqdm_common = {
    "ncols": 100,
    "bar_format": "{l_bar}{bar}| {n_fmt}/{total_fmt}",
}


def clear_cache(recreate_folder: bool = True):
    """Clear the cache folder."""
    shutil.rmtree(CACHE_FOLDER)
    if recreate_folder:
        os.makedirs(CACHE_FOLDER, exist_ok=True)


def download_file_from_https(url: str, filepath: Union[str, Path]):
    """
    Downloads a file from a https link to a local file.
    :param url: The url where to download the file.
    :param filepath: The path to the local file.
    :return: Downloaded file filename.
    """
    response = requests.get(url, stream=True)
    response.raise_for_status()
    response_size = int(response.headers.get("content-length", 0))
    filepath = Path(filepath)
    with open(filepath, "wb") as f:
        with tqdm(
            total=response_size,
            unit="B",
            unit_scale=True,
            desc=f"Processing file {filepath.name}",
            **tqdm_common,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                pbar.update(len(chunk))

    return filepath.name


def extract_file(zip_file, extract_folder):
    with ZipFile(zip_file, "r") as zip_ref:
        file_list = zip_ref.namelist()
        with tqdm(
            total=len(file_list), unit="file", desc="Extracting", **tqdm_common
        ) as pbar:
            for file in file_list:
                zip_ref.extract(file, extract_folder)  # Extract each file
                pbar.update(1)
    return True
