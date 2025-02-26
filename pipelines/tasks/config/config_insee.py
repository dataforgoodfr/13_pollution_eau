def get_insee_config() -> dict:
    """Configuration for La Poste dataset"""
    return {
        "source": {
            "id": "v_commune_2024.csv",
            "datetime": "2024-02-20",
        },
        "file": {
            "file_name": "insee_communes_2024.csv",
            "table_name": "cog_communes",
        },
    }
