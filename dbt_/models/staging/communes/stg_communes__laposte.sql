SELECT
    code_commune_insee::VARCHAR AS code_commune_insee,
    nom_de_la_commune::VARCHAR AS nom_de_la_commune,
    code_postal::VARCHAR AS code_postal,
    libelle_d_acheminement::VARCHAR AS libelle_d_acheminement,
    ligne_5::VARCHAR AS ligne_5,
    _geopoint::VARCHAR AS _geopoint,
    de_partition::SMALLINT AS de_partition,
    de_ingestion_date::VARCHAR AS de_ingestion_date
FROM {{ source('communes', 'laposte_communes') }}
