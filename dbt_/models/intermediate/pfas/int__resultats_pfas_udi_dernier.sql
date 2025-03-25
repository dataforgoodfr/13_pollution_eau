WITH latest_pfas_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau, cdparametresiseeaux
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pfas'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

aggregated_results AS (
    SELECT
        referenceprel,
        cdreseau,
        MIN(datetimeprel) AS datetimeprel,
        COUNT(DISTINCT cdparametresiseeaux) AS nb_params,
        -- La somme des 20 PFAS est disponible comme un paramètre (SPFAS)
        MAX(
            CASE WHEN cdparametresiseeaux = 'SPFAS' THEN valtraduite ELSE 0 END
        ) AS sum_20_pfas,
        COUNT(
            DISTINCT CASE
                WHEN cdparametresiseeaux = 'SPFAS' THEN cdparametresiseeaux
            END
        ) AS is_20_pfas,
        -- On calcule une somme de 4 PFAS pour une limite recommandée par le
        -- haut conseil de la santé public
        SUM(
            CASE
                WHEN
                    cdparametresiseeaux IN ('PFOA', 'PFOS', 'PFNA', 'PFHXS')
                    THEN valtraduite
                ELSE 0
            END
        ) AS sum_4_pfas,
        SUM(
            CASE
                WHEN
                    cdparametresiseeaux IN ('PFOA', 'PFOS', 'PFNA', 'PFHXS')
                    THEN 1
                ELSE 0
            END
        ) AS nb_4_pfas,
        MAX(
            CASE WHEN cdparametresiseeaux != 'SPFAS' THEN valtraduite END
        ) AS max_individual_pfas,
        COUNT(
            DISTINCT CASE
                WHEN valtraduite != 0 THEN cdparametresiseeaux
            END
        ) AS nb_quantified_params
    FROM latest_pfas_results
    WHERE row_number = 1
    GROUP BY referenceprel, cdreseau
    HAVING
        -- On vérifie que la somme des 20 PFAS est bien présente
        is_20_pfas = 1
        AND
        -- On vérifie que la somme des 4 PFAS est bien présente
        nb_4_pfas = 4
        -- TODO: On pourrait prendre essayer de prendre un autre prélèvement si
        -- le dernier n'a pas les 20 PFAS et les 4 PFAS
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
    END AS resultat
FROM aggregated_results
ORDER BY datetimeprel DESC

/*
Précisions importantes:

Pour le cas du PFAS individuel, on considère de manière arbitraire que
la valeur à ne pas égaler ou dépasser est de 0,1 µg/L.
À confirmer avec GF.

J'ai choisi de mettre ≥ au lieu de > pour les valeurs seuils.
À confirmer avec GF.
*/
