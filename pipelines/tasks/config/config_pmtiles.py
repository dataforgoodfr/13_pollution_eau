"""Configuration for DuckDB-based PMTiles generation."""

# Value columns to pivot for both data types
value_columns = [
    "resultat",
    "ratio",
    "date_dernier_prel",
    "nb_parametres",
    "nb_prelevements",
    "nb_sup_valeur_sanitaire",
    "parametres_detectes",
]

# Configuration for both commune and UDI data processing
config_pmtiles: dict[str, dict[str, str | list[str] | None]] = {
    "communes": {
        "result_table": "web__resultats_communes",
        "geom_table": "int__commune_geom",
        "id_columns": ["commune_code_insee", "commune_nom"],
        "result_id_column": "commune_code_insee",
        "geom_id_column": "com_code",
        "geom_name_column": "com_name",
        "output_filename": "commune_data",
        "layer_name": "data_communes",
    },
    "udi": {
        "result_table": "web__resultats_udi",
        "geom_table": "int__udi_geom",
        "id_columns": ["cdreseau", "nomreseaux", "population"],
        "result_id_column": "cdreseau",
        "geom_id_column": "code_udi",
        "geom_name_column": None,  # UDI geom table doesn't have a name column
        "output_filename": "udi_data",
        "layer_name": "data_udi",
    },
}
