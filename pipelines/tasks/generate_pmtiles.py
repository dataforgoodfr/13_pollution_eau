"""Generate PMTiles files using DuckDB for efficient data processing. Optional upload to S3.

This task generates two PMTiles files:
- commune_data.pmtiles: Contains commune-level water quality data with geometry
- udi_data.pmtiles: Contains UDI (water distribution unit) level data with geometry

The process uses DuckDB for efficient joining and pivoting of data.

Args:
    - env (str): Environment to upload to ("dev" or "prod")
    - upload (bool): Whether to upload the generated PMTiles files to S3 (default is False)
"""

from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.tasks.client.pmtiles_client import PmtilesClient
from pipelines.utils.logger import get_logger

logger = get_logger(__name__)


def execute(env: str, upload: bool = False):
    """
    Execute PMTiles generation process using DuckDB.

    Args:
        env: Environment to use ("dev" or "prod")
    """
    logger.info(f"Starting DuckDB-based PMTiles generation for environment: {env}")

    duckdb_client = DuckDBClient()

    try:
        processor = PmtilesClient(duckdb_client)
        processor.generate_pmtiles(env, upload=upload)

    finally:
        # Always close the database connection
        duckdb_client.close()
