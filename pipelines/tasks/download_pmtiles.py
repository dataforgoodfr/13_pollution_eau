"""
Download PMtiles files.

Args:
    - env (str): Environment to download from ("dev" or "prod")
    - use-boto3 (bool): Use boto3 library to download from S3 storage, instead of using public HTTPS URL (default: False)

Examples:
    - download_pmtiles --env prod : Download PMtiles from production environment
    - download_pmtiles --env dev  : Download PMtiles from development environment
    - download_pmtiles --use-boto3 : Download PMtiles from S3 storage
"""

import os
from abc import ABC, abstractmethod

from pipelines.config.config import get_s3_path_pmtiles
from pipelines.tasks.config.common import CACHE_FOLDER, download_file_from_https
from pipelines.utils.logger import get_logger
from pipelines.utils.storage_client import ObjectStorageClient

logger = get_logger(__name__)


class PMtilesDownloadStrategy(ABC):
    """Interface for GeoJSON download strategies."""

    def __init__(self):
        super().__init__()
        self.s3 = ObjectStorageClient()

    @abstractmethod
    def download(self, env: str, local_path: str):
        pass


class Boto3DownloadStrategy(PMtilesDownloadStrategy):
    """Strategy for downloading PMtiles from S3 storage using boto3."""

    def download(self, env: str, local_path: str):
        logger.info(f"Downloading PMtiles from S3 in environment {env}")
        remote_s3_path = get_s3_path_pmtiles(env)
        self.s3.download_object(remote_s3_path, local_path)
        logger.info(
            f"✅ GeoJSON downloaded from s3://{self.s3.bucket_name}/{remote_s3_path}"
        )


class HTTPSDownloadStrategy(PMtilesDownloadStrategy):
    """Strategy for downloading PMtiles via HTTPS."""

    def download(self, env: str, local_path: str):
        logger.info("Downloading PMtiles via HTTPS")
        remote_s3_path = get_s3_path_pmtiles(env)
        url = f"https://{self.s3.bucket_name}.{self.s3.endpoint_url.split('https://')[1]}/{remote_s3_path}"
        download_file_from_https(url=url, filepath=local_path)
        logger.info(f"✅ GeoJSON downloaded via HTTPS: {url} -> {local_path}")


class PMtilesDownloader:
    """Manages the PMtiles download process."""

    def __init__(self, strategy: PMtilesDownloadStrategy, env: str):
        self.strategy = strategy
        self.local_geojson_path = os.path.join(
            CACHE_FOLDER, "new-georef-france-commune-prelevement.pmtiles"
        )
        if env not in ("dev", "prod"):
            raise ValueError("'env' must be 'dev' or 'prod'")
        self.env = env

    def download(self):
        self.strategy.download(self.env, self.local_geojson_path)


def execute(env: str, use_boto3: bool = False):
    """
    Execute PMtiles download using the appropriate strategy.

    Args:
        env (str): Environment to download from ("dev" or "prod")
        use_boto3 (bool): Whether to use boto3 instead of HTTPS. Default is False.
    """
    strategy = Boto3DownloadStrategy() if use_boto3 else HTTPSDownloadStrategy()
    downloader = PMtilesDownloader(strategy, env)
    downloader.download()
