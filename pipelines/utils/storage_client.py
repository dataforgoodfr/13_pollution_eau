import os
import io
import logging
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
import pandas as pd
from tqdm import tqdm

"""Client class to interact with Scaleway Object Storage."""

logger = logging.getLogger(__name__)


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

    def list_objects(self, prefix=None):
        try:
            response = self.client_v4.list_objects(
                Bucket=self.bucket_name, Prefix=prefix
            )
            if "Contents" in response:
                return response["Contents"]
            else:
                return []
        except ClientError as e:
            logger.error(
                "Error list_objects in bucket %s: %s/%s", self.bucket_name, prefix, e
            )

    def download_object(self, file_key, local_path):
        # Get file size
        try:
            meta_data = self.client_v4.head_object(
                Bucket=self.bucket_name, Key=file_key
            )
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
        except ClientError as e:
            logger.error(
                "Error deleting object '%s' from S3 bucket '%s': %s",
                file_key,
                self.bucket_name,
                e,
            )

    def upload_object(self, local_path, file_key=None, public_read=False):
        try:
            if file_key is None:
                file_key = os.path.basename(local_path)

            self.client_v2.upload_file(
                local_path,
                self.bucket_name,
                file_key,
                ExtraArgs={"ACL": "public-read"} if public_read else None,
            )
        except ClientError as e:
            logger.error(
                "Boto Client Error upload_object '%s' to bucket '%s': %s",
                local_path,
                self.bucket_name,
                e,
            )
        except Exception as e:
            logger.error(
                "Error upload_object '%s' to bucket '%s': %s",
                local_path,
                self.bucket_name,
                e,
            )

    def upload_dataframe(self, df, file_key):
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)

        # Upload the buffer to S3
        try:
            self.client_v2.put_object(
                Bucket=self.bucket_name, Key=file_key, Body=csv_buffer.getvalue()
            )
        except ClientError as e:
            logger.error(
                "Error upload_dataframe to S3 bucket '%s': %s", self.bucket_name, e
            )

    def read_object_as_dataframe(self, file_key):
        try:
            response = self.client_v4.get_object(Bucket=self.bucket_name, Key=file_key)
            csv_data = response["Body"].read().decode("utf-8")
            df = pd.read_csv(io.StringIO(csv_data))
            return df
        except ClientError as e:
            logger.error(
                "Error read_object_as_dataframe '%s' from S3 bucket '%s': %s",
                file_key,
                self.bucket_name,
                e,
            )
            return pd.DataFrame()

    def delete_object(self, key):
        try:
            self.client_v4.delete_object(Bucket=self.bucket_name, Key=key)
        except ClientError as e:
            logger.error(
                "Error delete_object '%s' from S3 bucket '%s': %s",
                key,
                self.bucket_name,
                e,
            )
