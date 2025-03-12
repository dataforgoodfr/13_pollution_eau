

def get_opendatasoft_config() -> dict:
    """Get OpenDataSoft configuration parameters.

    Returns:
        dict: Configuration parameters for OpenDataSoft client
    """
    return {
        "base_url": "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/",
        "dataset_name": "georef-france-commune",
        "chunk_size": 8192,
    }
