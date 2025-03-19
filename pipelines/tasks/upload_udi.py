import logging
from pathlib import Path

from pipelines.config.config import get_environment, get_s3_udi_path
from pipelines.tasks.client.https_client import HTTPSClient
from pipelines.tasks.config.common import CACHE_FOLDER, DUCKDB_FILE
from pipelines.utils.storage_client import ObjectStorageClient

logger = logging.getLogger(__name__)


"""_summary_
Va falloir qu’on mette à jour le dockerfile du site pour intégrer cette table et activer la geospatial extension
Faudrait tester ça rapidement (la geospatial extension et le ST_Contains) avant qu’on fasse tout le dev
Livrable:
- Télécharger les données UDI séléctionné par l'étude réalisé dans ce ticket: https://noco.services.dataforgood.fr/dashboard/#/nc/pk1vq1pm8frc5lm/ms9uz8er4jpow7j/vwalcv3k4abo1sxq?rowId=168
- Les stocker sur S3 pour le moment dans prod/UDI/filename
- Ajouter a build database le telechargement des données depuis S3 et la création d'une table udi
- Utiliser l'extension spatial de duckdb et vérifier que l'on peux utiliser ST_contains pour faire des recherche dans les UDI par lat/lon: https://duckdb.org/docs/stable/extensions/spatial/functions#st_contains
- Va falloir créer une table avec les tracés des UDIS
---------
- Faudrait tester ça rapidement (la geospatial extension et le ST_Contains) avant qu’on fasse tout le dev
- alloir créer une table avec les tracés des UDIS
- Va falloir qu’on mette à jour le dockerfile du site pour intégrer cette table et activer la geospatial extension
"""


# REPERTOIRE_DATA_ATLASANTE = Path(
#     CACHE_FOLDER,
#     "Telechargement_1741623465_2416/d51b5c43-812d-420f-a641-83e18ddb8628_1741623465_7231",
# )


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
