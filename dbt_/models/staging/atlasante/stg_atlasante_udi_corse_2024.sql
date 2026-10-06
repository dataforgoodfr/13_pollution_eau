SELECT
    cn_udi::VARCHAR AS code_udi,
    nom_udi::VARCHAR AS nom_udi,
    etat::VARCHAR AS etat,
    usage::VARCHAR AS usage_udi,
    geom::GEOMETRY AS geom,
    ingestion_date::DATE AS ingestion_date
FROM {{ source('atlasante', 'atlasante_udi_corse_2024') }}
