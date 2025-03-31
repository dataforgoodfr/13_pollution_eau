def get_opendatasoft_config() -> dict:
    """Get OpenDataSoft configuration parameters.

    Returns:
        dict: Configuration parameters for OpenDataSoft client
    """

    return {
        "source": {
            "base_url": "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/",
            "id": "georef-france-commune/exports/geojson",
            "datetime": "20240220",
        },
        "file": {
            "file_name": "georef-france-commune.geojson",
            "table_name": "opendatasoft_communes",
        },
    }

    return {
        "base_url": "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/",
        "dataset_name": "georef-france-commune",
        "chunk_size": 8192,
    }
