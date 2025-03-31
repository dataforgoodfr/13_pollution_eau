SELECT
    com_code[1] AS com_code,
    com_name[1] AS com_name,
    ST_AsGeoJSON(geom) AS geometry
FROM {{ source('communes', 'opendatasoft_communes') }}
