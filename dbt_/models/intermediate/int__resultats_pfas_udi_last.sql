WITH latest_pfas_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau, cdparametresiseeaux
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE categorie = 'pfas'
),

aggregated_results AS (
    SELECT
        referenceprel,
        cdreseau,
        datetimeprel,
        MAX(
            CASE WHEN cdparametresiseeaux = 'SPFAS' THEN valtraduite ELSE 0 END
        ) AS sum_20_pfas,
        SUM(
            CASE
                WHEN
                    cdparametresiseeaux IN ('PFOA', 'PFOS', 'PFNA', 'PFHXS')
                    THEN valtraduite
                ELSE 0
            END
        ) AS sum_4_pfas,
        MAX(
            CASE WHEN cdparametresiseeaux != 'SPFAS' THEN valtraduite END
        ) AS max_individual_pfas,
        COUNT(
            DISTINCT CASE
                WHEN valtraduite NOT IN (0, 1) THEN cdparametresiseeaux
            END
        ) AS nb_quantified_params
    FROM latest_pfas_results
    WHERE row_number = 1
    GROUP BY referenceprel, cdreseau, datetimeprel
)

SELECT
    referenceprel,
    cdreseau,
    'pfas' AS categorie,
    datetimeprel AS last_datetimeprel,
    'dernier prélèvement' AS periode,
    CASE
        WHEN
            sum_20_pfas IS NULL AND nb_quantified_params = 0
            THEN 'Aucun paramètre n’a été quantifié'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas < 0.02
            THEN 'Somme des 20 PFAS < 0,1 µg/L et somme des 4 PFAS < 0,02 µg/L'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas >= 0.02
            THEN 'Somme des 20 PFAS < 0,1 µg/L et somme des 4 PFAS >= 0,02 µg/L'
        WHEN sum_20_pfas >= 0.1 THEN 'Somme des 20 PFAS >= 0,1 µg/L'
        WHEN
            max_individual_pfas >= 0.1
            THEN 'Au moins 1 PFAS >= valeur sanitaire (0,1 µg/L)'
        ELSE 'Erreur de classification'
    END AS result
FROM aggregated_results
ORDER BY datetimeprel DESC
