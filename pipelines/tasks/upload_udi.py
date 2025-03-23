import logging
from pathlib import Path

from pipelines.config.config import get_environment, get_s3_udi_path
from pipelines.tasks.config.common import CACHE_FOLDER
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


def upload_udi(env: str = "dev"):
    """
    1, ici, il faut manuellement download the fichier pour l'instant.
    2, donwload udi geojson from
    Direction Générale de la Santé - Unités de distribution (UDI) et infofactures:
    https://catalogue.atlasante.fr/geosource/panierDownloadFrontalParametrage/d51b5c43-812d-420f-a641-83e18ddb8628
    Format des données:GeoJson (fichier *.json)
    Projection des données: WGS84 - GPS (EPSG 4326) [EPSG:4326]. [EPSG:4326]=>cela c'est du format avec longitude et latitude.
    3, mettre le dgs_metropole_udi_infofactures_j.json file dans database/cache/dgs_metropole_udi_infofactures_j.json
    """
    logger.info("Uploading uid geojson to S3")
    local_path = Path(CACHE_FOLDER, "dgs_metropole_udi_infofactures_j.json")
    env = get_environment(default=env)
    s3_path = get_s3_udi_path(env, "dgs_metropole_udi_infofactures_j.json")
    # upload to s3
    s3 = ObjectStorageClient()
    print("local ", local_path, "remote", s3_path)
    s3_loc = s3.upload_object(local_path=local_path, file_key=s3_path, public_read=True)
    logger.info(f"✅ UDI GeoJson uploaded to {s3_loc}")


def execute(env):
    upload_udi(env)
