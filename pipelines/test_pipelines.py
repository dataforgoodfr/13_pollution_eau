from unittest.mock import patch

from pipelines.tasks import build_database, download_database, upload_database


def test_upload_database():
    with patch("pipelines.tasks.upload_database.ObjectStorageClient") as mock_s3:
        upload_database.execute(env="dev")
        mock_s3.return_value.upload_object.assert_called_once()


def test_download_database():
    with patch("pipelines.tasks.download_database.ObjectStorageClient"):
        with patch(
            "pipelines.tasks.download_database.download_file_from_https"
        ) as mock_download:
            download_database.execute(env="dev")
            mock_download.assert_called_once()


def test_build_database():
    with patch("pipelines.tasks.build_database.DuckDBClient") as mock_duckdb:
        with patch("pipelines.tasks.build_database.DataGouvClient") as mock_datagouv:
            with patch("pipelines.tasks.build_database.CommuneClient") as mock_commune:
                with patch(
                    "pipelines.tasks.build_database.OpenDataSoftClient"
                ) as mock_opendatasoft:
                    with patch(
                        "pipelines.tasks.build_database.UploadedGeoJSONClient"
                    ) as mock_geojson:
                        build_database.execute(refresh_type="last")

                        mock_datagouv.return_value.process_edc_datasets.assert_called_once_with(
                            refresh_type="last",
                            custom_years=[],
                            drop_tables=False,
                            check_update=False,
                        )
                        mock_commune.return_value.process_datasets.assert_called_once()
                        mock_opendatasoft.return_value.process_datasets.assert_called_once()
                        mock_geojson.return_value.process_datasets.assert_called_once()
                        mock_duckdb.return_value.close.assert_called_once()
