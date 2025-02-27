SELECT
    code_commune_insee::VARCHAR as code_commune_insee,
    nom_de_la_commune::VARCHAR AS nom_de_la_commune,
    code_postal::VARCHAR as code_postal,
    libelle_d_acheminement::VARCHAR as libelle_d_acheminement,
    ligne_5::VARCHAR as ligne_5,
    _geopoint::VARCHAR as _geopoint,
    de_partition::SMALLINT as de_partition,
    de_ingestion_date::VARCHAR as de_ingestion_date
FROM {{ source('communes', 'laposte_communes') }}