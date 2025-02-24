import io
import os

import boto3
import pandas as pd
from botocore.client import Config
from tqdm import tqdm

"""Client class to interact with Scaleway Object Storage."""


class ObjectStorageClient:
    region_name = "fr-par"
    endpoint_url = "https://s3.fr-par.scw.cloud"
    bucket_name = "pollution-eau-s3"

    def __init__(self):
        # Need to use V2 signature for upload and V4 for download
        self.client_v2 = self.build_client("s3")
        self.client_v4 = self.build_client("s3v4")

    @staticmethod
    def build_client(signature_version: str = "s3v4"):
        return boto3.session.Session().client(
            service_name="s3",
            config=Config(signature_version=signature_version),
            region_name=ObjectStorageClient.region_name,
            use_ssl=True,
            endpoint_url=ObjectStorageClient.endpoint_url,
            aws_access_key_id=os.getenv("SCW_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("SCW_SECRET_KEY"),
        )

    # def list_buckets(self):
    #     response = self.client_v4.list_buckets()
    #     return response['Buckets']

    def list_objects(self):
        response = self.client_v4.list_objects(Bucket=self.bucket_name)
        if "Contents" in response:
            return response["Contents"]
        else:
            return []

    def download_object(self, file_key, local_path):
        # Get file size
        meta_data = self.client_v4.head_object(Bucket=self.bucket_name, Key=file_key)
        total_length = int(meta_data.get("ContentLength", 0))

        # Configure the callback to update the progress bar
        with tqdm(
            total=total_length, unit="iB", unit_scale=True, desc=file_key
        ) as pbar:
            self.client_v4.download_file(
                self.bucket_name,
                file_key,
                local_path,
                Callback=lambda bytes_transferred: pbar.update(bytes_transferred),
            )

    def upload_object(self, local_path, file_key=None, public_read=False):
        if file_key is None:
            file_key = os.path.basename(local_path)
        self.client_v2.upload_file(
            local_path,
            self.bucket_name,
            file_key,
            ExtraArgs={"ACL": "public-read"} if public_read else None,
        )

    def upload_dataframe(self, df, file_key):
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)

        # Upload the buffer to S3
        self.client_v2.put_object(
            Bucket=self.bucket_name, Key=file_key, Body=csv_buffer.getvalue()
        )

    def read_object_as_dataframe(self, file_key):
        response = self.client_v4.get_object(Bucket=self.bucket_name, Key=file_key)
        csv_data = response["Body"].read().decode("utf-8")
        df = pd.read_csv(io.StringIO(csv_data))
        return df

    def delete_object(self, key):
        self.client_v4.delete_object(Bucket=self.bucket_name, Key=key)
