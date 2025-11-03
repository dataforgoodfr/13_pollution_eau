from pathlib import Path
from typing import Union

import requests

from pipelines.tasks.config.common import download_file_from_https, logger


class HTTPSClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def download_file_from_https(self, path: str, filepath: Union[str, Path]):
        """
        Downloads a file from a https link to a local file.
        :param path: The url path to download the file.
        :param filepath: The path to the local file.
        :return: Downloaded file filename.
        """
        url = self.base_url + path
        return download_file_from_https(url, filepath)

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
            return dict(response.headers)
        except requests.exceptions.RequestException as ex:
            logger.error(f"Exception raised: {ex}")
            return {}
