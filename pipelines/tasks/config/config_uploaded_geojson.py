"""Configuration for uploaded GeoJSON files.

Cette configuration supporte plusieurs fichiers GeoJSON uploadés manuellement sur S3.
Pour ajouter un nouveau fichier, ajoutez simplement un dictionnaire dans la liste 'files'.

Format de chaque fichier:
- path: chemin relatif du fichier sur S3 (sera combiné avec prefix)
- table_name: nom de la table à créer dans DuckDB
- file_name: nom du fichier local à télécharger
"""

uploaded_geojson_config = {
    "source": {
        "prefix": "upload",  # Préfixe S3
    },
    "files": [
        # {
        #     # Cette première source contient le GeoJSON des UDIs de Atlasante issu des infofactures pour la métropole pour l'année 2023.
        #     # Pour l'obtenir:
        #     # - partir de la source suivante: https://catalogue.atlasante.fr/geonetwork/srv/fre/catalog.search#/metadata/1d02cd8b-137d-4360-b566-f6082a47ee32
        #     # - cliquer sur "accès à la carte" (normalement on arrive sur cette URL: https://carto.atlasante.fr/1/ars_metropole_udi_infofactures.map)
        #     # - à gauche de la carte, cliquer sur le bouton avec les trois "couches"
        #     # - choisir le layer "Réseaux (UDI) - 2023" dans la liste (dans "Historique"), puis cliquer sur les trois points à droite, puis cliquer sur "Télécharger la donnée"
        #     # - choisir format "GeoJSON" et projection "WGS84 - GPS (EPSG 4326)" puis cliquer sur "Exécution directe" pour télécharger le fichier
        #     # - extraire le fichier "dgs_metropole_udi_infofactures_j.json" du zip téléchargé
        #     # - renommer le fichier téléchargé et l'uploader dans le dossier approprié (cf `path` ci-dessous)
        #     #
        #     "path": "atlasante/udi_infofactures_2023.json",
        #     "table_name": "atlasante_udi_2023",
        #     "local_file_name": "udi_infofactures_2023.json",
        # },
        # {
        #     # UDIs de la Corse
        #     # Pour l'obtenir:
        #     # - partir de la source suivante: https://catalogue.atlasante.fr/geonetwork/srv/fre/catalog.search#/metadata/67a6998e-15b2-4796-9584-c87af156f549
        #     # - sur "Accès au téléchargement des données", cliquer sur "Télécharger"
        #     # - choisir format "GeoJSON" et projection "WGS84 - GPS (EPSG 4326)" puis cliquer sur "Exécution directe" pour télécharger le fichier
        #     # - extraire le fichier "ars_r94_udi_2018_z.json" du zip téléchargé
        #     # - renommer le fichier téléchargé et l'uploader dans le dossier approprié (cf `path` ci-dessous)
        #     #
        #     "path": "atlasante/udi_corse.json",
        #     "table_name": "atlasante_udi_corse",
        #     "local_file_name": "udi_corse.json",
        # },
        # {
        #     # GeoJSON des UDIs de Atlasante issu des infofactures pour l'année 2024.
        #     # S'obtient de la même manière que pour l'année 2023 (cf. commentaire dans le premier bloc).
        #     # Concernant la couverture géographique, il s'agit de la métropole + Corse.
        #     "path": "atlasante/udi_infofactures_2024.json",
        #     "table_name": "atlasante_udi_2024",
        #     "local_file_name": "udi_infofactures_2024.json",
        # },
        {
            # UDIs de la métropole (hors Corse) pour l'année 2025, issues des infofactures (DGS).
            # Pour l'obtenir: https://telechargement.atlasante.fr/download/f28ea03e-706a-43e4-97f4-b801f5b67a66
            # Puis extraire le fichier "dgs_metropole_udi_2025_j.json" du zip téléchargé et l'uploader tel quel
            # Attention : contrairement au millésime 2024, la Corse n'est pas incluse (cf. bloc suivant)
            # et le seul attribut disponible est code_udi.
            "path": "atlasante/dgs_metropole_udi_2025_j.json",
            "table_name": "atlasante_udi_2025",
            "local_file_name": "dgs_metropole_udi_2025_j.json",
        },
        {
            # UDIs de la Corse pour l'année 2024 (ARS Corse).
            # Pour l'obtenir: https://telechargement.atlasante.fr/download/f3ff41b2-c3ad-41eb-ad97-6b5d9bf15de4
            # Puis extraire le fichier "ars_r94_udi_2024_z.json" du zip téléchargé et l'uploader tel quel
            "path": "atlasante/ars_r94_udi_2024_z.json",
            "table_name": "atlasante_udi_corse_2024",
            "local_file_name": "ars_r94_udi_2024_z.json",
        },
    ],
}
