{{
  config(
    materialized='table'
  )
}}

SELECT
    inseecommune,
    cdreseau,
    de_partition,
    -- Prenons toujours le même nom de commune pour une inseecommune donnée
    MIN(nomcommune) AS nomcommune,
    -- Agréger les différentes valeurs de quartier en une liste sans doublons
    STRING_AGG(DISTINCT quartier) FILTER (
        WHERE quartier IS NOT NULL AND quartier != '' AND quartier != '-'
    ) AS quartiers,
    -- Agréger les différentes valeurs de nomreseau en une liste sans doublons
    STRING_AGG(DISTINCT nomreseau) FILTER (
        WHERE nomreseau IS NOT NULL AND nomreseau != ''
    ) AS nomreseaux,
    -- Prendre la première date de début d'alimentation
    MIN(debutalim) AS debutalim
FROM
    {{ ref('stg_edc__communes') }}
GROUP BY
    inseecommune,
    cdreseau,
    de_partition
