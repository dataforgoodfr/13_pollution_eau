SELECT
    com_code[1] AS com_code,
    com_name[1] AS com_name,
    ST_ASGEOJSON(geom) AS geom
FROM {{ source('communes', 'opendatasoft_communes') }}
