import os

from dotenv import load_dotenv

from pipelines.utils.logger import get_logger

logger = get_logger(__name__)

current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the .env file
dotenv_path = os.path.join(current_dir, ".env")


def load_env_variables():
    load_dotenv(dotenv_path)


def get_environment(default="prod"):
    env = os.getenv("ENV", default)
    logger.info(f"Running on env {env}")
    if env not in ["dev", "prod"]:
        raise ValueError(f"Invalid environment: {env}. Must be 'dev' or 'prod'.")
    return env


def get_s3_path(env, filename="data.duckdb"):
    return f"{env}/database/{filename}"


def get_s3_udi_path(env, filename):
    return f"{env}/UDI/{filename}"


def get_s3_path_geojson(env, filename="new-georef-france-commune-prelevement.geojson"):
    """Get the S3 path for GeoJSON file based on environment.

    Args:
        env (str): Environment ("dev" or "prod")

    Returns:
        str: S3 path for the GeoJSON file
    """
    if env not in ["dev", "prod"]:
        raise ValueError("Environment must be 'dev' or 'prod'")
    return f"{env}/geojson/{filename}"


def get_s3_path_pmtiles(env, filename="georef-france-commune-prelevement.pmtiles"):
    if env not in ["dev", "prod"]:
        raise ValueError("Environment must be 'dev' or 'prod'")
    return f"{env}/pmtiles/{filename}"
