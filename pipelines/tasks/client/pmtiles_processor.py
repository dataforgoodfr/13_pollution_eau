import logging
import subprocess
from pathlib import Path

from pipelines.config.config import get_s3_path_pmtiles
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


class PmtilesProcessor:
    def convert_geojson_to_pmtiles(self, geojson_file, pmtiles_file):
        """Convert a GeoJSON file to PMTiles format using Tippecanoe."""
        try:
            # Construct the Tippecanoe command
            command = [
                "tippecanoe",
                "-o",
                pmtiles_file,  # Output PMTiles file
                "-zg",  # Zoom levels
                "--drop-densest-as-needed",  # Drops features to reduce density
                geojson_file,  # Input GeoJSON file
            ]
            # if file already exists then remove it
            if Path(pmtiles_file).exists():
                Path(pmtiles_file).unlink()
            # Run the command
            subprocess.run(command, check=True)
            logger.info(f"Successfully converted '{geojson_file}' to '{pmtiles_file}'.")

        except subprocess.CalledProcessError as e:
            logger.error(f"Error during conversion: {e}")
        except Exception as e:
            logger.error(f"An error occurred: {e}")

    def upload_pmtils_to_storage(self, env: str, pmtils_path: str):
        """
        Upload the Pmtiles file to Storage Object depending on the environment
        This requires setting the correct environment variables for the Scaleway credentials
        """
        s3 = ObjectStorageClient()
        s3_path = get_s3_path_pmtiles(env)

        s3.upload_object(local_path=pmtils_path, file_key=s3_path, public_read=True)
        logger.info(f"✅ pmtils uploaded to s3://{s3.bucket_name}/{s3_path}")
        url = (
            f"https://{s3.bucket_name}.{s3.endpoint_url.split('https://')[1]}/{s3_path}"
        )
        return url
