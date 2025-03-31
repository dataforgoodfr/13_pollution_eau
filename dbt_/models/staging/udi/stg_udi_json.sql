SELECT
    code_udi::VARCHAR AS code_udi,
    code_ins::VARCHAR AS code_ins,
    ins_nom::VARCHAR AS ins_nom,
    ST_AsGeoJSON(geom) AS geometry
FROM {{ source('udi', 'atlasante_udi') }}
WHERE code_udi IS NOT NULL
