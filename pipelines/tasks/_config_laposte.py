def get_cog_config() -> dict:
    """Configuration for La Poste dataset"""
    return {
        "source": {
            "id": "8262de72-138f-4596-ad2f-10079e5f4d7c",  # ID du fichier v_communes_2024.csv
            "datetime": "2024-02-20",
        },
        "file": {
            "file_name": "v_communes_2024.csv",
            "table_name": "laposte_commune",
        },
    }
