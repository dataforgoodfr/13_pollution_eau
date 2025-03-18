# pipelines/tasks/client/opendatasoft_client.py


from pipelines.tasks.client.https_client import HTTPSClient
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
        self.https_client = HTTPSClient(base_url=self.base_url)

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
        path = f"{dataset}/exports/geojson"

        # Use of HTTPSClient to download the file with progress bar
        filename = self.https_client.download_file_from_https(
            path=path, filepath=output_path
        )

        return filename
