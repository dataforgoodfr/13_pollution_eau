from pathlib import Path
from typing import Union

import requests
from tqdm import tqdm

from pipelines.tasks._common import logger, tqdm_common


class HTTPSClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def download_file_from_https(self, path: str, filepath: Union[str, Path]):
        """
        Downloads a file from a https link to a local file.
        :param path: The url where to download the file.
        :param filepath: The path to the local file.
        :return: Downloaded file filename.
        """
        url = self.base_url + path
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

    @staticmethod
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
