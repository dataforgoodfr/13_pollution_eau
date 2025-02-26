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

from pipelines.tasks.client.datagouv_client import COGDataset, DataGouvClient
from pipelines.tasks.client.insee_client import InseeClient

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
    insee = InseeClient()
    insee.process_datasets()
    laposte = COGDataset()
    laposte.process_datasets()
    data_gouv_client = DataGouvClient()
    data_gouv_client.process_edc_datasets(
        refresh_type=refresh_type,
        custom_years=custom_years,
        drop_tables=drop_tables,
        check_update=check_update,
    )
