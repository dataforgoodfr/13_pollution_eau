WITH
pfas_prels AS (
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        limite_qualite,
        valeur_sanitaire_1,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pfas'
),

-- 1 : Agrégation des résultats en une seule ligne par prélèvement / udi / année
pfas_results_udi_agg AS (
    SELECT
        referenceprel,
        cdreseau,
        annee,
        -- La somme des 20 PFAS est disponible comme un paramètre (SPFAS)
        MAX(
            CASE WHEN cdparametresiseeaux = 'SPFAS' THEN valtraduite ELSE 0 END
        ) AS sum_20_pfas,
        COUNT(
            DISTINCT CASE
                WHEN cdparametresiseeaux = 'SPFAS' THEN cdparametresiseeaux
            END
        ) AS is_20_pfas,
        -- On check si la somme des 20 PFAS est supérieure
        -- à la limite reglementaire
        COUNT(
            DISTINCT CASE
                WHEN
                    (
                        CASE
                            WHEN
                                cdparametresiseeaux = 'SPFAS'
                                THEN valtraduite
                            ELSE 0
                        END
                    )
                    >= limite_qualite
                    THEN cdparametresiseeaux
            END
        ) AS sum_20_pfas_above_limit,
        COUNT(
            DISTINCT CASE
                WHEN
                    valeur_sanitaire_1 IS NOT NULL
                    AND valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    THEN cdparametresiseeaux
            END
        ) AS nb_pfas_above_vs
    FROM pfas_prels
    GROUP BY referenceprel, cdreseau, annee
    -- On drop les très rares cas où il n'y a pas la somme des 20 PFAS
    HAVING is_20_pfas = 1
)

SELECT
    cdreseau,
    annee,
    'pfas' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    ROUND((
        SUM(CASE WHEN sum_20_pfas_above_limit = 1 THEN 1 ELSE 0 END)
        /
        COUNT(DISTINCT referenceprel)
    ), 2) AS ratio_depassements_limite_reg,
    (CASE
        WHEN
            MAX(nb_pfas_above_vs) > 0
            THEN 'min_1_pfas_sup_valeur_sanitaire'
        WHEN
            MAX(nb_pfas_above_vs) = 0
            THEN 'aucun_pfas_sup_valeur_sanitaire'
        ELSE 'erreur'
    END) AS resultat_limite_sanitaire
FROM pfas_results_udi_agg
GROUP BY cdreseau, annee
