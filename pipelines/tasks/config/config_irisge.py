def get_irisge_config() -> dict:
    """Configuration for La Tracee dataset"""
    return {
        "source": {"base_url": "https://data.geopf.fr/telechargement/download/"},
        "file": {
            "file_key": "IRIS-GE/IRIS-GE_3-0__SHP_LAMB93_FXX_2024-01-01",
            "zip_name": "IRIS-GE_3-0__SHP_LAMB93_FXX_2024-01-01.7z",
            "middle_path": "IRIS-GE_3-0__SHP_LAMB93_FXX_2024-01-01/IRIS-GE/1_DONNEES_LIVRAISON_2024-06-00156/IRIS-GE_3-0_SHP_LAMB93_FXX-ED2024-01-01",
            "file_name": "IRIS_GE.shp",
            "table_name": "irig_ge",
        },
    }
