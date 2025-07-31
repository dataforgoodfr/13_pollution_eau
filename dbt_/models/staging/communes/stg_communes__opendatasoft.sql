SELECT
    com_code[1]::VARCHAR AS com_code,
    com_name[1]::VARCHAR AS com_name,
    geom::GEOMETRY AS geom
FROM {{ source('communes', 'opendatasoft_communes') }}
