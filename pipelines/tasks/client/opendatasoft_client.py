# pipelines/tasks/client/opendatasoft_client.py

import requests
from typing import Dict, Any
import json


class OpenDataSoftClient:
    def __init__(self, base_url: str = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/"):
        self.base_url = base_url

    def download_geojson(self, dataset_name: str, output_path: str) -> str:
        """
        Download GeoJSON data from OpenDataSoft

        Args:
            dataset_name: Name of the dataset (e.g. 'georef-france-commune')
            output_path: Path where to save the GeoJSON file
        """
        url = f"{self.base_url}{dataset_name}/exports/geojson"
        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return output_path
