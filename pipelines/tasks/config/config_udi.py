def get_udi_config() -> dict:
    """Configuration for udi"""
    return {
        "source": {
            "base_url": "https://pollution-eau-s3.s3.fr-par.scw.cloud/dev/UDI/",
            "id": "dgs_metropole_udi_infofactures_j.json",
            "datetime": "2024",
        },
        "file": {
            "file_name": "atlasante_udi.json",
            "table_name": "atlasante_udi",
        },
    }
