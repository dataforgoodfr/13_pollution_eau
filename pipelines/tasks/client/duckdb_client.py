from dataclasses import dataclass
from typing import List, Union

import duckdb

from pipelines.tasks.config.common import DUCKDB_FILE, logger


class DuckDBClient:
    """
    A client to interact with the DuckDB database.
    :param conn: A DuckDB connection
    """

    from duckdb import DuckDBPyConnection

    def __init__(self, conn: DuckDBPyConnection = duckdb.connect(DUCKDB_FILE)):
        self.conn = conn

    @dataclass
    class SQLFilters:
        """
        A data class to normalize SQL Filters
        """

        colname: str
        filter_value: str = None
        coltype: str = None
        operator: str = None

    def check_table_existence(self, table_name: str) -> bool:
        """
        Check if a table exists in the duckdb database
        :param table_name: The table name to check existence
        :return: True if the table exists, False if not
        """
        query = """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_name = ?
            """
        self.conn.execute(query, (table_name,))
        return list(self.conn.fetchone())[0] == 1

    def drop_tables(self, table_names: Union[str, List[str]]):
        """
        Drop tables in the duckdb database
        :param table_names: A table name or a list of table names to drop
        """
        if isinstance(table_names, str):
            table_names = list(table_names)

        for table_name in table_names:
            query = f"DROP TABLE IF EXISTS {table_name};"
            logger.info(f"Drop table {table_name} (query: {query})")
            self.conn.execute(query)
        return True

    def delete_from_table(self, table_name, filters: List[SQLFilters]):
        """
        Delete data from tables verifying the SQLFilters
        :param table_name: Table name
        :param filters: SQLFilter for the where clause

        Example:
        duckcb_client.delete_from_table(
            table_name=edc_communes,
            filters=[
                duckcb_client.SQLFilters(
                    colname="de_partition",
                    filter_value="2024",
                    coltype="INTEGER",
                )
            ],
        )
        """

        query = f"""
            DELETE FROM {table_name}
        """
        for i, filter in enumerate(filters):
            if i == 0:
                query = query + " WHERE "
            else:
                query = query + f" {filter.operator} "

            query = (
                query
                + f" {filter.colname} = CAST({filter.filter_value} AS {filter.coltype}) "
            )

        query = query + " ;"
        self.conn.execute(query=query)
        return True

    def ingest_from_csv(
        self,
        ingest_type: str,
        table_name: str,
        de_partition: str,
        dataset_datetime: str,
        filepath: str,
    ):
        """
        Ingest data from a csv file to a table
        :param ingest_type: INSERT or CREATE.
        :param table_name: Table name
        :param de_partition: Data Engineering partition
        :param dataset_datetime: Datetime of the dataset
        :param filepath: CSV Filepath
        """
        if ingest_type == "INSERT":
            query = f"INSERT INTO {table_name} "
        elif ingest_type == "CREATE":
            query = f"CREATE TABLE {table_name} AS "
        else:
            raise ValueError("ingest_type parameter needs to be INSERT or CREATE")

        query = (
            query
            + f"""
            SELECT
                *,
                CAST({de_partition} AS INTEGER)     AS de_partition,
                current_date                        AS de_ingestion_date,
                {dataset_datetime}                  AS de_dataset_datetime
            FROM read_csv('{filepath}', header=true, delim=',');
        """
        )
        self.conn.execute(query)
        return True

    def close(self):
        """
        Close the connection
        """
        self.conn.close()
        return True
