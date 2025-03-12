# pipelines/tasks/client/opendatasoft_client.py

import requests

from pipelines.tasks.config.config_geojson import get_opendatasoft_config


class OpenDataSoftClient:
    def __init__(self, config: dict = None):
        """
        Initialize OpenDataSoft client with configuration

        Args:
            config: Configuration dictionary. If None, loads from config file
        """
        self.config = config or get_opendatasoft_config()
        self.base_url = self.config["base_url"]

    def download_geojson(
        self, dataset_name: str = None, output_path: str = None
    ) -> str:
        """
        Download GeoJSON data from OpenDataSoft

        Args:
            dataset_name: Name of the dataset (e.g. 'georef-france-commune')
            output_path: Path where to save the GeoJSON file
        """
        dataset = dataset_name or self.config["dataset_name"]
        url = f"{self.base_url}{dataset}/exports/geojson"
        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=self.config["chunk_size"]):
                f.write(chunk)

        return output_path
