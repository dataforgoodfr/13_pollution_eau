WITH
pfas_prels AS (
    SELECT DISTINCT
        de_partition AS annee,
        inseecommune,
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
        inseecommune,
        annee,
        -- La somme des 20 PFAS est disponible comme un paramètre (SPFAS)
        MAX(
            CASE WHEN cdparametresiseeaux = 'SPFAS' THEN valtraduite ELSE 0 END
        ) AS sum_20_pfas,
        COUNT(
            DISTINCT CASE
                WHEN cdparametresiseeaux = 'SPFAS' THEN referenceprel
            END
        ) AS count_20_pfas,
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
        -- On check si la somme des 20 PFAS est supérieure
        -- à la limite reglementaire
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'SPFAS'
                    AND limite_qualite IS NOT NULL
                    AND valtraduite IS NOT NULL
                    AND valtraduite > limite_qualite
                    THEN 1
                ELSE 0
            END
        ) AS sum_20_pfas_above_limit,
        MAX(
            CASE
                WHEN
                    valeur_sanitaire_1 IS NOT NULL
                    AND valtraduite IS NOT NULL
                    AND valtraduite > valeur_sanitaire_1
                    THEN 1
                ELSE 0
            END
        ) AS has_pfas_above_vs,
        MAX(datetimeprel) AS max_datetimeprel
    FROM pfas_prels
    GROUP BY referenceprel, inseecommune, annee
    -- On drop les très rares cas où il n'y a pas la somme des 20 PFAS
    HAVING count_20_pfas = 1
)

SELECT
    inseecommune,
    annee,
    'pfas' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    ROUND((
        SUM(CASE WHEN sum_20_pfas_above_limit = 1 THEN 1 ELSE 0 END)
        /
        COUNT(DISTINCT referenceprel)
    ), 2) AS ratio_limite_qualite,
    SUM(has_pfas_above_vs) AS nb_sup_valeur_sanitaire,
    TO_JSON({
        'SPFAS': MAX(sum_20_pfas),
        'SUM_4_PFAS': MAX(sum_4_pfas)
    }) AS parametres_detectes,
    MAX(max_datetimeprel) AS date_dernier_prel

FROM pfas_results_udi_agg
GROUP BY inseecommune, annee
