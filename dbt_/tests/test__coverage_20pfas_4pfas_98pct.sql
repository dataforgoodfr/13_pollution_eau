-- Dans le calcul des résultats PFAS derniers prélèvements
-- (int__resultats_pfas_udi_dernier.sql), on présuppose que la plupart du temps
-- la somme des 20 PFAS (SPFAS) et la somme des 4 PFAS (PFOA, PFOS, PFNA,
-- PFHXS) sont bien présentes. Ce test permet de vérifier que pour au moins 98%
-- des couples cdreseau/referenceprel c'est le cas.

WITH yearly_pfas_results AS (
    SELECT
        cdreseau,
        referenceprel,
        -- Vérifie si la somme des 20 PFAS est disponible
        COUNT(
            DISTINCT CASE
                WHEN cdparametresiseeaux = 'SPFAS' THEN cdparametresiseeaux
            END
        ) AS has_sum_20_pfas,
        -- Vérifie si tous les 4 PFAS spécifiques sont disponibles
        COUNT(
            DISTINCT CASE
                WHEN
                    cdparametresiseeaux IN ('PFOA', 'PFOS', 'PFNA', 'PFHXS')
                    THEN cdparametresiseeaux
            END
        ) AS count_4_pfas
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pfas'
        AND CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
    GROUP BY cdreseau, referenceprel
)

SELECT

    COUNT(*) AS total_aggregations,
    -- Pourcentage d'agrégations avec la somme des 20 PFAS présente
    ROUND(
        (
            SUM(CASE WHEN has_sum_20_pfas = 1 THEN 1 ELSE 0 END)
            * 100.0
            / COUNT(*)
        ),
        2
    ) AS pct_with_sum_20_pfas,
    -- Pourcentage d'agrégations avec tous les 4 PFAS spécifiques présents
    ROUND(
        (SUM(CASE WHEN count_4_pfas = 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),
        2
    ) AS pct_with_all_4_pfas
FROM yearly_pfas_results

HAVING pct_with_sum_20_pfas < 98 OR pct_with_all_4_pfas < 98
