import subprocess
from pathlib import Path

from pipelines.config.config import get_s3_path_pmtiles
from pipelines.utils.logger import get_logger
from pipelines.utils.storage_client import ObjectStorageClient

logger = get_logger(__name__)

config = {
    "communes": "georef-france-commune-prelevement.pmtiles",
    "udi": "georef-france-udi-prelevement.pmtiles",
}


class PmtilesProcessor:
    def __init__(self, type="communes"):
        if type not in config.keys():
            raise Exception(f"type {type} must be in {config.keys()}")
        self.upload_file_path = config[type]

    def convert_geojson_to_pmtiles(
        self, geojson_file: str, pmtiles_file: str, layer="data_communes"
    ):
        """Convert a GeoJSON file to PMTiles format using Tippecanoe."""
        # try:
        # Construct the Tippecanoe command
        command = [
            "tippecanoe",
            "-zg",  # Zoom levels
            "-o",  # output
            pmtiles_file,  # Output PMTiles file
            "--layer",  # le nom de la couche dans les tuiles vectorielles
            layer,
            "--coalesce-densest-as-needed",
            "--extend-zooms-if-still-dropping",
            geojson_file,  # Input GeoJSON file
        ]
        # if file already exists then remove it
        if Path(pmtiles_file).exists():
            Path(pmtiles_file).unlink()
        # Run the command
        subprocess.run(command, check=True)
        logger.info(f"Successfully converted '{geojson_file}' to '{pmtiles_file}'.")

        # except subprocess.CalledProcessError as e:
        #     logger.error(f"Error during conversion: {e}")
        # except Exception as e:
        #     logger.error(f"An error occurred: {e}")

    def upload_pmtils_to_storage(self, env: str, pmtils_path: str):
        """
        Upload the Pmtiles file to Storage Object depending on the environment
        This requires setting the correct environment variables for the Scaleway credentials
        """
        s3 = ObjectStorageClient()
        s3_path = get_s3_path_pmtiles(env, self.upload_file_path)

        s3.upload_object(local_path=pmtils_path, file_key=s3_path, public_read=True)
        logger.info(f"✅ pmtils uploaded to s3://{s3.bucket_name}/{s3_path}")
        url = (
            f"https://{s3.bucket_name}.{s3.endpoint_url.split('https://')[1]}/{s3_path}"
        )
        return url
