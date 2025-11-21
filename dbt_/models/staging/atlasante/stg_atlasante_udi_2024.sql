SELECT
    gid::INTEGER AS gid,
    code_udi::VARCHAR AS code_udi,
    ins_nom::VARCHAR AS ins_nom,
    uge_nom::VARCHAR AS uge_nom,
    udi_pop::VARCHAR AS udi_pop,
    geom::GEOMETRY AS geom,
    ingestion_date::DATE AS ingestion_date
FROM {{ source('atlasante', 'atlasante_udi_2024') }}
