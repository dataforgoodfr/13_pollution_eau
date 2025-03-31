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

valeurs_sanitaires (cdparametresiseeaux, valeur_sanitaire) AS (
    SELECT * FROM (
        VALUES
        ('PFOA', 0.075),
        ('PFHPA', 0.075),
        ('PFHXA', 960),
        ('PFPEA', 960),
        ('PFBA', 72),
        ('PFBS', 240),
        ('PFOS', 0.18),
        ('PFHXS', 12)
        -- TODO : vérifier unicité de cdparametresiseeaux
    )
),

latest_pfas_results_with_valeurs_sanitaires AS (
    SELECT
        r.*,
        vs.valeur_sanitaire
    FROM latest_pfas_results AS r
    LEFT JOIN valeurs_sanitaires AS vs
        ON r.cdparametresiseeaux = vs.cdparametresiseeaux
    WHERE r.row_number = 1
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
        COUNT(
            DISTINCT CASE
                WHEN
                    valeur_sanitaire IS NOT NULL
                    AND valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire
                    THEN cdparametresiseeaux
            END
        ) AS nb_pfas_above_limit,
        COUNT(
            DISTINCT CASE
                WHEN valtraduite != 0 THEN cdparametresiseeaux
            END
        ) AS nb_quantified_params
    FROM latest_pfas_results_with_valeurs_sanitaires
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
            nb_pfas_above_limit > 0
            THEN 'un_pfas_sup_valeur_sanitaire'
        WHEN
            nb_quantified_params = 0
            THEN 'aucun_parametre_quantifie'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas < 0.02
            THEN 'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas >= 0.02
            THEN 'somme_20pfas_inf_0_1_et_4pfas_sup_0_02'
        WHEN sum_20_pfas >= 0.1 THEN 'somme_20pfas_sup_0_1'
        ELSE 'erreur'
    END AS resultat
FROM aggregated_results
ORDER BY datetimeprel DESC

/*
Précisions importantes:

J'ai choisi de mettre ≥ au lieu de > pour les valeurs seuils.
À confirmer avec GF.
*/
