"""
Consolidate data into the database.

Args:
    - refresh-type (str) : Type of refresh to perform ("all", "last", or "custom")
    - custom-years (str) : List of years to process when refresh_type is "custom"
    - drop-tables        : Drop all table before ingestion if flag is added
    - check-update       : For edc, only refresh table if source was updated since last refresh
    - refresh-table (str): Source to refresh ("all", "edc", "commune", "atlasante")

Examples:
    - build_database --refresh-table all : refresh all tables
    - build_database --refresh-table edc : only refresh edc tables
    - build_database --refresh-table commune : only refresh commune tables
    - build_database --refresh-table atlasante : only refresh tables from atlasante
    - build_database --refresh-type all : Process all years
    - build_database --refresh-type last : Process last year only
    - build_database --refresh-type custom --custom-years 2018,2024 : Process only the years 2018 and 2024
    - build_database --refresh-type last --drop-tables : Drop tables and process last year only
    - build_database --refresh-type all --check_update : Process only years whose data has been modified from the source
    - build_database --refresh-type last --check_update : Process last year if its data has been modified from the source
    - build_database --refresh-type custom --custom-years 2018,2024 --check_update : Process only the years 2018 and 2024 if their data has been modified from the source
"""

from typing import List, Literal

from pipelines.tasks.client.commune_client import CommuneClient
from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.tasks.client.datagouv_client import DataGouvClient
from pipelines.tasks.client.opendatasoft_client import OpenDataSoftClient
from pipelines.tasks.client.uploaded_geojson_client import UploadedGeoJSONClient
from pipelines.tasks.config.config_insee import get_insee_config
from pipelines.tasks.config.config_uploaded_geojson import uploaded_geojson_config
from pipelines.utils.logger import get_logger

logger = get_logger(__name__)


def execute(
    refresh_type: Literal["all", "last", "custom"] = "all",
    refresh_table: str = "all",
    custom_years: List[str] = [],
    drop_tables: bool = False,
    check_update: bool = False,
):
    """
    Execute the EDC dataset processing with specified parameters.

    :param refresh_type: Type of refresh to perform ("all", "last", or "custom")
    :param refresh_table: which tables to refresh ("all", "edc", "commune", "atlasante")
    :param custom_years: List of years to process when refresh_type is "custom"
    :param drop_tables: Whether to drop edc tables in the database before data insertion.
    """
    # Build database
    duckdb_client = DuckDBClient()
    logger.info(
        f"build_database args:refresh_type={refresh_type}  refresh_table={refresh_table} custom_years={custom_years}"
    )
    if refresh_table == "all" or refresh_table == "edc":
        data_gouv_client = DataGouvClient(duckdb_client)
        data_gouv_client.process_edc_datasets(
            refresh_type=refresh_type,
            custom_years=custom_years,
            drop_tables=drop_tables,
            check_update=check_update,
        )
    # pour l'instant, les Commune et UDI a seulement la donnee de 2024.
    # il y a pas besoin d'update les deux tables si nous voulons utiliser custom_year pour update seulement edc
    if refresh_table == "all" or refresh_table == "commune":
        insee_client = CommuneClient(get_insee_config(), duckdb_client)
        insee_client.process_datasets()
        opendatasoft = OpenDataSoftClient(duckdb_client)
        opendatasoft.process_datasets()
    if refresh_table == "all" or refresh_table == "atlasante":
        geojson_client = UploadedGeoJSONClient(uploaded_geojson_config, duckdb_client)
        geojson_client.process_datasets()

    duckdb_client.close()
