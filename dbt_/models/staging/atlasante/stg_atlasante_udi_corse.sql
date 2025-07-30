SELECT
    gid::INTEGER AS gid,
    cn_udi::VARCHAR AS cn_udi,
    nom_udi::VARCHAR AS nom_udi,
    geom::GEOMETRY AS geom,
    ingestion_date::DATE AS ingestion_date
FROM {{ source('atlasante', 'atlasante_udi_corse') }}
