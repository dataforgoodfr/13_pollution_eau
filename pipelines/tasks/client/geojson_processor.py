import pandas as pd

from pipelines.tasks.client.core.duckdb_client import DuckDBClient
from pipelines.utils.logger import get_logger

logger = get_logger(__name__)

config = {
    "communes": {
        "result_table": "ana__resultats_communes",
        "geom_table": "stg_communes__opendatasoft_json",
        "groupby_columns": ["commune_code_insee", "commune_nom"],
        "result_join_column": "commune_code_insee",
        "geom_join_column": "com_code",
    },
    "udi": {},
}


class GeoJSONProcessor:
    def __init__(self, type):
        duckdb_client = DuckDBClient()
        self.conn = duckdb_client.conn
        if type not in config.keys():
            raise Exception(f"type {type} must be in {config.keys()}")
        self.config = config[type]

    @staticmethod
    def create_properties(row):
        output = {}
        for col_name, valeur in row.items():
            if col_name != "geometry":
                if isinstance(valeur, dict):
                    output.update(valeur)
                else:
                    output.update({col_name: valeur})
        return output

    @staticmethod
    def create_geojson(df):
        output = {"type": "FeatureCollection"}
        features = df[["type", "geometry", "properties"]].to_dict(orient="records")
        output.update({"features": features})
        return output

    def generate_geojson(self):
        results_df = self.conn.sql(f"SELECT * FROM {self.config['result_table']}").df()
        geom_df = self.conn.sql(f"SELECT * FROM {self.config['geom_table']};").df()

        results_df_lookup = (
            results_df.groupby(self.config["groupby_columns"])
            .apply(
                lambda x: {
                    f"resultat_cvm_{row['annee']}": row["resultat_cvm"]
                    for _, row in x.iterrows()
                },
                include_groups=False,
            )
            .reset_index(name="resultats_dict")
        )
        output_df = pd.merge(
            geom_df,
            results_df_lookup,
            how="left",
            left_on=self.config["geom_join_column"],
            right_on=self.config["result_join_column"],
        )
        output_df["properties"] = output_df.apply(
            lambda row: self.create_properties(row), axis=1
        )
        output_df["type"] = "Feature"

        output_geojson = self.create_geojson(output_df)
        return output_geojson
