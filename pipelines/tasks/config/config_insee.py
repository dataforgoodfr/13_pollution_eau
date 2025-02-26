def get_insee_config() -> dict:
    """Configuration for La Poste dataset"""
    return {
        "source": {
            "base_url": "https://www.insee.fr/fr/statistiques/fichier/7766585/",
            "id": "v_commune_2024.csv",
            "datetime": "20240220",
        },
        "file": {
            "file_name": "insee_communes_2024.csv",
            "table_name": "cog_communes",
        },
    }
