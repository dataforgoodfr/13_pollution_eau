-- Vérifie que chaque tracé de int__udi_geom est exploitable : géométrie non
-- nulle, non vide, valide et de type (Multi)Polygon.
-- Les sources Atlasante contiennent des géométries nulles, vides ou invalides
-- (ex. millésime 2025 : 005000714, 083000888, 088001381...) qui doivent être
-- écartées ou réparées dans int__udi_geom.
--
-- Ce test doit retourner 0 ligne pour passer.

SELECT
    code_udi,
    ST_GEOMETRYTYPE(geom_original) AS type_geom
FROM {{ ref('int__udi_geom') }}
WHERE
    geom_original IS null
    OR ST_ISEMPTY(geom_original)
    OR NOT ST_ISVALID(geom_original)
    OR ST_GEOMETRYTYPE(geom_original) NOT IN ('POLYGON', 'MULTIPOLYGON')
