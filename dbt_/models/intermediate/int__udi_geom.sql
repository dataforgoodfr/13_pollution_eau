{{
  config(
    materialized='table'
  )
}}

-- Référentiel des tracés UDI :
-- - métropole hors Corse : millésime 2025 (la Corse n'y figure pas)
-- - Corse : millésime 2024 de l'ARS Corse
WITH combined_data AS (
    SELECT
        code_udi,
        geom
    FROM {{ ref("stg_atlasante_udi_2025") }}
    WHERE LEFT(code_udi, 3) NOT IN ('02A', '02B')

    UNION ALL

    SELECT
        code_udi,
        geom
    FROM {{ ref("stg_atlasante_udi_corse_2024") }}
    WHERE LEFT(code_udi, 3) IN ('02A', '02B')
),

cleaned_data AS (
    SELECT
        code_udi,
        ST_MAKEVALID(geom) AS geom
    FROM combined_data
    WHERE
        code_udi IS NOT null
        AND code_udi != ''
        AND geom IS NOT null
        AND NOT ST_ISEMPTY(geom)
),

-- Une même UDI peut être découpée en plusieurs features (morceaux disjoints) :
-- on les fusionne au lieu d'en garder une seule.
-- ST_COLLECTIONEXTRACT(..., 3) ne garde que les polygones (ST_MAKEVALID peut
-- produire des lignes/points résiduels).
merged_data AS (
    SELECT
        code_udi,
        ST_COLLECTIONEXTRACT(ST_MAKEVALID(ST_UNION_AGG(geom)), 3) AS geom
    FROM cleaned_data
    GROUP BY code_udi
)

SELECT
    code_udi,
    geom AS geom_original,
    ST_ASGEOJSON(geom) AS geom
FROM merged_data
WHERE NOT ST_ISEMPTY(geom)
