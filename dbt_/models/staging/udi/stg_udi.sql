SELECT
    code_udi::VARCHAR AS code_udi,
    code_ins::VARCHAR AS code_ins,
    ins_nom::VARCHAR AS ins_nom,
    geom::GEOMETRY AS geom
FROM {{ source('udi', 'atlasante_udi') }}
WHERE code_udi IS NOT NULL
