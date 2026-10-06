-- Vérifie qu'au moins 98% des UDI actuelles (dernière année de UDI_COM, hors
-- DOM) ont un tracé dans int__udi_geom.
-- Couverture constatée : 98,8% avec le millésime Atlasante 2024, 99,2% avec
-- le référentiel 2025 (métropole) + 2024 (Corse).
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
    COUNT(*) AS nb_udi,
    COUNT(g.code_udi) AS nb_udi_avec_trace,
    ROUND(COUNT(g.code_udi) * 100.0 / COUNT(*), 2) AS pct_couverture
FROM udi_actuelles AS u
LEFT JOIN {{ ref('int__udi_geom') }} AS g
    ON u.cdreseau = g.code_udi
HAVING pct_couverture < 98
