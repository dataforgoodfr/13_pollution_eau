SELECT
    code_udi::VARCHAR AS code_udi,
    geom::GEOMETRY AS geom,
    ingestion_date::DATE AS ingestion_date
FROM {{ source('atlasante', 'atlasante_udi_2025') }}
