import logging
import subprocess

logger = logging.getLogger(__name__)


def convert_geojson_to_pmtiles(geojson_file, pmtiles_file):
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

        # Run the command
        subprocess.run(command, check=True)
        logger.info(f"Successfully converted '{geojson_file}' to '{pmtiles_file}'.")

    except subprocess.CalledProcessError as e:
        logger.error(f"Error during conversion: {e}")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
