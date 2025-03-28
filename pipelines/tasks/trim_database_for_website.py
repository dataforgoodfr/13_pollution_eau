"""
Trim database for website use.

This task reduces the size of the DuckDB database by keeping only tables needed for the website.
It creates a new database file with only the specified tables.

Args:
    - output-file (str): Path to save the trimmed database (default: database/database_website.duckdb)
    - tables-list (str): Comma-separated list of tables to keep (overrides default list)

Examples:
    - trim_database_for_website : Create a trimmed database with default tables
    - trim_database_for_website --output-file custom_path.duckdb : Save to custom location
    - trim_database_for_website --tables-list table1,table2,table3 : Keep only specified tables
"""

import logging
import os

import duckdb

from pipelines.tasks.config.common import DUCKDB_FILE

logger = logging.getLogger(__name__)

# Default tables to keep - update this list with the actual tables needed for the website
DEFAULT_WEBSITE_TABLES = [
    "web__resultats_communes",
    "web__resultats_udi",
    "cog_communes",
]

DEFAULT_OUTPUT_FILE = "database/database_website.duckdb"


def execute(
    output_file: str | None = None,
    tables_list: str | None = None,
):
    """
    Execute the database trimming process.

    1. Connect to a DuckDB in-memory instance
    2. Attach both source and destination databases
    3. Copy only the selected tables to the destination database

    :param output_file: Path to save the trimmed database
    :param tables_list: Comma-separated list of tables to keep (overrides default list)
    """
    # Use provided output file or default
    output_file = output_file or DEFAULT_OUTPUT_FILE
    output_file = os.path.abspath(output_file)
    logger.info(f"Output file: {output_file}")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Use provided tables list or default
    tables_to_keep = []
    if tables_list:
        tables_to_keep = [table.strip() for table in tables_list.split(",")]
        logger.info(f"Using custom tables list: {tables_to_keep}")
    else:
        tables_to_keep = DEFAULT_WEBSITE_TABLES
        logger.info(f"Using default tables list: {tables_to_keep}")

    # Remove existing output file if it exists
    if os.path.exists(output_file):
        os.remove(output_file)

    # Connect to a DuckDB instance
    conn = duckdb.connect(":memory:")

    # Attach source and destination databases
    conn.execute(f"ATTACH DATABASE '{DUCKDB_FILE}' AS source (READ_ONLY)")
    conn.execute(f"ATTACH DATABASE '{output_file}' AS destination")

    # Get list of all tables from source
    available_tables = conn.execute("SHOW ALL TABLES").fetchall()
    # In results of SHOW ALL TABLES, the first column is the database name, the second column is the schema name, and the third column is the table name
    available_table_names = [
        table[2]
        for table in available_tables
        if table[0] == "source" and table[1] == "main"
    ]
    logger.info(f"Available tables in source database: {available_table_names}")

    # Check if all requested tables exist
    missing_tables = [
        table for table in tables_to_keep if table not in available_table_names
    ]
    if missing_tables:
        raise ValueError(f"Requested tables not found in database: {missing_tables}")

    # Final list of tables to copy (intersection of requested tables and available tables)
    tables_to_copy = [
        table for table in tables_to_keep if table in available_table_names
    ]

    logger.info(f"Will copy {len(tables_to_copy)} table(s) to trimmed database")

    # Copy each table using CREATE TABLE AS
    for table_name in tables_to_copy:
        logger.info(f"Copying table: {table_name}")
        conn.execute(
            f"CREATE TABLE destination.{table_name} AS SELECT * FROM source.{table_name}"
        )

    # Close connection
    conn.close()

    # Get file sizes for comparison
    source_size = os.path.getsize(DUCKDB_FILE) / (1024 * 1024)  # Size in MB
    target_size = os.path.getsize(output_file) / (1024 * 1024)  # Size in MB
    size_reduction = (1 - target_size / source_size) * 100 if source_size > 0 else 0

    logger.info("✅ Database trimmed successfully")
    logger.info(f"   - Original size: {source_size:.2f} MB")
    logger.info(f"   - New size: {target_size:.2f} MB")
    logger.info(f"   - Size reduction: {size_reduction:.2f}%")
    logger.info(f"   - Saved to: {output_file}")
