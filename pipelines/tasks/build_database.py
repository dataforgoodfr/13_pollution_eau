"""
Consolidate data into the database.

Args:
    - refresh-type (str): Type of refresh to perform ("all", "last", or "custom")
    - custom-years (str): List of years to process when refresh_type is "custom"

Examples:
    - build_database --refresh-type all : Process all years
    - build_database --refresh-type last : Process last year only
    - build_database --refresh-type custom --custom-years 2018,2024 : Process only the years 2018 and 2024
    - build_database --refresh-type last --drop-tables : Drop tables and process last year only
    - build_database --refresh-type all --check_update : Process only years whose data has been modified from the source
    - build_database --refresh-type last --check_update : Process last year if its data has been modified from the source
    - build_database --refresh-type custom --custom-years 2018,2024 --check_update : Process only the years 2018 and 2024 if their data has been modified from the source
"""

import logging
from typing import List

from pipelines.tasks.client.commune_client import CommuneClient
from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.tasks.client.datagouv_client import DataGouvClient
from pipelines.tasks.client.udi_client import UDIClient
from pipelines.tasks.config.config_insee import get_insee_config
from pipelines.tasks.config.config_laposte import get_laposte_config
from pipelines.tasks.config.config_udi import get_udi_config

logger = logging.getLogger(__name__)


def execute(
    refresh_type: str = "all",
    custom_years: List[str] = None,
    drop_tables: bool = False,
    check_update: bool = False,
):
    """
    Execute the EDC dataset processing with specified parameters.

    :param refresh_type: Type of refresh to perform ("all", "last", or "custom")
    :param custom_years: List of years to process when refresh_type is "custom"
    :param drop_tables: Whether to drop edc tables in the database before data insertion.
    """
    # Build database
    duckdb_client = DuckDBClient()

    # data_gouv_client = DataGouvClient(duckdb_client)
    # data_gouv_client.process_edc_datasets(
    #     refresh_type=refresh_type,
    #     custom_years=custom_years,
    #     drop_tables=drop_tables,
    #     check_update=check_update,
    # )

    # insee_client = HTTPSToDuckDBClient(get_insee_config())
    # insee_client.process_datasets()
    # laposte = HTTPSToDuckDBClient(get_laposte_config())
    # laposte.process_datasets(get_udi_config())

    # insee_client = CommuneClient(get_insee_config(), duckdb_client)
    # insee_client.process_datasets()
    # laposte = CommuneClient(get_laposte_config(), duckdb_client)
    # laposte.process_datasets()

    udi_client = UDIClient(get_udi_config(), duckdb_client)
    udi_client.process_datasets()
    duckdb_client.close()
