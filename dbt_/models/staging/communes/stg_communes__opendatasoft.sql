SELECT
    com_code::VARCHAR AS com_code,
    com_name::VARCHAR AS com_name,
    geom::GEOMETRY AS geom
FROM {{ source('communes', 'opendatasoft_communes') }}
