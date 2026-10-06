-- Vérifie que chaque département (hors DOM) a au moins 70% de ses UDI
-- actuelles couvertes par un tracé dans int__udi_geom.
-- Permet de détecter une région entière absente d'une source : le millésime
-- Atlasante 2025 (DGS métropole) ne contient pas la Corse, qui doit être
-- complétée par la source de l'ARS Corse.
-- Département le moins couvert constaté : 093 (14 UDI sur 18, soit 77,8%).
--
-- Ce test doit retourner 0 ligne pour passer.

WITH derniere_partition AS (
    SELECT MAX(de_partition) AS de_partition
    FROM {{ ref('stg_edc__communes') }}
),

udi_actuelles AS (
    SELECT DISTINCT c.cdreseau
    FROM {{ ref('stg_edc__communes') }} AS c
    INNER JOIN derniere_partition AS p
        ON c.de_partition = p.de_partition
    WHERE LEFT(c.cdreseau, 3) NOT IN ('971', '972', '973', '974', '975', '976')
)

SELECT
    LEFT(u.cdreseau, 3) AS departement,
    COUNT(*) AS nb_udi,
    COUNT(g.code_udi) AS nb_udi_avec_trace,
    ROUND(COUNT(g.code_udi) * 100.0 / COUNT(*), 2) AS pct_couverture
FROM udi_actuelles AS u
LEFT JOIN {{ ref('int__udi_geom') }} AS g
    ON u.cdreseau = g.code_udi
GROUP BY LEFT(u.cdreseau, 3)
HAVING pct_couverture < 70
