import json

import pandas as pd
from tqdm import tqdm

from pipelines.config.config import get_s3_path_geojson
from pipelines.tasks.config.config_geojson import (
    col_input,
    config_merge_geo,
    list_column_result,
)
from pipelines.utils.logger import get_logger
from pipelines.utils.storage_client import ObjectStorageClient

tqdm.pandas()

logger = get_logger(__name__)


class GeoJSONProcessor:
    def __init__(self, type, duckdb_client):
        self.conn = duckdb_client.conn
        if type not in config_merge_geo.keys():
            raise Exception(f"type {type} must be in {config_merge_geo.keys()}")
        self.config = config_merge_geo[type]
        self.col_resultats_dict = "resultats_dict"

    def create_properties(self, row):
        output = {}
        for col_name, valeur in row.items():
            if col_name in self.config["groupby_columns"] + [self.col_resultats_dict]:
                if isinstance(valeur, dict):
                    output.update(valeur)
                else:
                    if not pd.isna(valeur):
                        output.update({col_name: valeur})
        return output

    @staticmethod
    def create_geojson(df):
        output = {"type": "FeatureCollection"}
        features = df[["type", "geometry", "properties"]].to_dict(orient="records")
        output.update({"features": features})
        return output

    @staticmethod
    def process_group(df_group):
        output = {}
        for _, row in df_group.iterrows():
            name = ""
            for col in col_input:
                if name == "":
                    name += row[col]
                else:
                    name += "_" + row[col]

            output.update(
                {name + "_" + result: row[result] for result in list_column_result}
            )
        return output

    def generate_geojson(self):
        results_df = self.conn.sql(f"SELECT * FROM {self.config['result_table']}").df()
        results_df["date_dernier_prel"] = results_df["date_dernier_prel"].dt.strftime(
            "%Y-%m-%d %H:%M:%S"
        )  # convert timestamp to string because timestamp not json seriaziable
        results_df = results_df.astype(object).where(pd.notnull(results_df), "")
        geom_df = self.conn.sql(f"SELECT * FROM {self.config['geom_table']};").df()
        geom_df = geom_df.rename(columns={"geom": "geometry"})
        geom_df["geometry"] = geom_df["geometry"].map(lambda x: json.loads(x))
        results_df_lookup = (
            results_df.groupby(self.config["groupby_columns"])
            .progress_apply(
                lambda x: self.process_group(x),
                include_groups=False,
            )
            .reset_index(name=self.col_resultats_dict)
        )
        output_df = pd.merge(
            geom_df,
            results_df_lookup,
            how="left",
            left_on=self.config["geom_join_column"],
            right_on=self.config["result_join_column"],
        )
        output_df = output_df.fillna(
            ""
        )  # some lines are present in geojson but not in results
        output_df["properties"] = output_df.apply(
            lambda row: self.create_properties(row), axis=1
        )
        output_df["type"] = "Feature"

        output_geojson = self.create_geojson(output_df)
        return output_geojson

    def upload_geojson_to_storage(self, env: str, file_path: str):
        """
        Upload the Pmtiles file to Storage Object depending on the environment
        This requires setting the correct environment variables for the Scaleway credentials
        """
        s3 = ObjectStorageClient()
        s3_path = get_s3_path_geojson(env, self.config["upload_file_name"])

        s3.upload_object(local_path=file_path, file_key=s3_path, public_read=True)
        logger.info(f"✅ pmtils uploaded to s3://{s3.bucket_name}/{s3_path}")
        url = (
            f"https://{s3.bucket_name}.{s3.endpoint_url.split('https://')[1]}/{s3_path}"
        )
        return url
