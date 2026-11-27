SELECT
    cn_udi::VARCHAR AS code_udi,
    udi_nom::VARCHAR AS nom_udi,
    nom_uge::VARCHAR AS nom_uge,
    population::INTEGER AS population,
    nature_eau::VARCHAR AS nature_eau,
    epci::VARCHAR AS epci,
    geom::GEOMETRY AS geom,
    ingestion_date::DATE AS ingestion_date
FROM {{ source('atlasante', 'atlasante_udi_reunion_2025') }}
