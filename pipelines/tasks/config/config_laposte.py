def get_laposte_config() -> dict:
    """Configuration for La Poste dataset"""
    return {
        "source": {
            "base_url": "https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/metadata-attachments/",
            "id": "base-officielle-codes-postaux.csv",
            "datetime": "20240220",
        },
        "file": {
            "file_name": "laposte_communes_2024.csv",
            "table_name": "laposte_communes",
        },
    }
