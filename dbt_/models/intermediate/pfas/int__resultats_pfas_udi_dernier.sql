WITH latest_pfas_results AS (
    SELECT
        cdreseau,
        referenceprel,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        limite_qualite,
        valeur_sanitaire_1,
        valtraduite,
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
        COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
        MAX(datetimeprel) AS datetimeprel,
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
                    valeur_sanitaire_1 IS NOT NULL
                    AND valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    THEN cdparametresiseeaux
            END
        ) AS nb_pfas_above_limit,
        COUNT(
            DISTINCT CASE
                WHEN valtraduite != 0 THEN cdparametresiseeaux
            END
        ) AS nb_quantified_params,
        TO_JSON(
            MAP(
                LIST(
                    cdparametresiseeaux
                    ORDER BY cdparametresiseeaux
                ) FILTER (WHERE valtraduite > 0
                ),
                LIST(
                    valtraduite
                    ORDER BY cdparametresiseeaux
                ) FILTER (WHERE valtraduite > 0
                )
            )
        ) AS parametres_detectes
    FROM latest_pfas_results
    WHERE row_number = 1 -- On garde seulement le dernier prélèvement 
    -- pour chaquecouple cdreseau/referenceprel
    GROUP BY referenceprel, cdreseau
    HAVING
        -- On vérifie que la somme des 20 PFAS est bien présente,
        -- ce qui est quasiment toujours le cas (>98% des cas)
        -- cf test de couverture dans test__coverage_20pfas_4pfas_98pct.sql
        is_20_pfas = 1
        AND
        -- Idem pour les 4 PFAS
        nb_4_pfas = 4
)

SELECT
    cdreseau,
    'pfas' AS categorie,
    'dernier_prel' AS periode,
    datetimeprel AS date_dernier_prel,
    nb_parametres,
    parametres_detectes,
    CASE
        WHEN
            nb_pfas_above_limit > 0
            THEN 'sup_valeur_sanitaire'
        WHEN
            nb_quantified_params = 0
            THEN 'non_quantifie'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas < 0.02
            -- On laisse les valeurs 0.1 et 0.02 en dur car 0.02 n'est pas
            -- dans le fichier de GF. Plus compréhensible comme ça
            THEN 'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
        WHEN
            sum_20_pfas < 0.1 AND sum_4_pfas >= 0.02
            THEN 'somme_20pfas_inf_0_1_et_4pfas_sup_0_02'
        WHEN sum_20_pfas >= 0.1 THEN 'somme_20pfas_sup_0_1'
        ELSE 'erreur'
    END AS resultat
FROM aggregated_results
ORDER BY datetimeprel DESC
