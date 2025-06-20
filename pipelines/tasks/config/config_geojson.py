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


config_merge_geo = {
    "communes": {
        "result_table": "web__resultats_communes",
        "geom_table": "stg_communes__opendatasoft_json",
        "groupby_columns": ["commune_code_insee", "commune_nom"],
        "result_join_column": "commune_code_insee",
        "geom_join_column": "com_code",
        "upload_file_name": "georef-france-communes-prelevement.geojson",
    },
    "udi": {
        "result_table": "web__resultats_udi",
        "geom_table": "stg_udi_json",
        "groupby_columns": ["cdreseau", "nomreseaux"],
        "result_join_column": "cdreseau",
        "geom_join_column": "code_udi",
        "upload_file_name": "georef-france-udi-prelevement.geojson",
    },
}

col_input = ["periode", "categorie"]

list_column_result = [
    "resultat",
    "ratio",
    "date_dernier_prel",
    "nb_parametres",
    "nb_prelevements",
    "nb_sup_valeur_sanitaire",
    "parametres_detectes",
]
