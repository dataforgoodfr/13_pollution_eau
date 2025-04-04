WITH pfas_results AS (
    SELECT
        *,
        -- On retire les doublons de prélèvements dus aux communes
        ROW_NUMBER() OVER (
            PARTITION BY
                cdreseau, referenceprel, cdparametresiseeaux, datetimeprel
            ORDER BY cdreseau
        ) AS row_num
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pfas'
),

-- Création d'une table de valeurs sanitaires (définies par GF)
valeurs_sanitaires (cdparametresiseeaux, valeur_sanitaire) AS (
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
),

-- 1 : Jointure résultats pfas <> valeurs sanitaires
pfas_results_udi_vs AS (
    SELECT
        pr.referenceprel,
        pr.cdreseau,
        pr.cdparametresiseeaux,
        pr.de_partition AS annee,
        pr.datetimeprel,
        pr.valtraduite,
        vs.valeur_sanitaire,
        pr.unite,
        pr.categorie
    FROM pfas_results AS pr
    LEFT JOIN valeurs_sanitaires AS vs
        ON pr.cdparametresiseeaux = vs.cdparametresiseeaux
    WHERE pr.row_num = 1
),

-- 2 : Agrégation des résultats en une seule ligne par prélèvement / udi / année
pfas_results_udi_agg AS (
    SELECT
        referenceprel,
        cdreseau,
        annee,
        COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
        -- La somme des 20 PFAS est disponible comme un paramètre (SPFAS)
        MAX(
            CASE WHEN cdparametresiseeaux = 'SPFAS' THEN valtraduite ELSE 0 END
        ) AS sum_20_pfas,
        COUNT(
            DISTINCT CASE
                WHEN cdparametresiseeaux = 'SPFAS' THEN cdparametresiseeaux
            END
        ) AS is_20_pfas,
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
    FROM pfas_results_udi_vs
    GROUP BY referenceprel, cdreseau, annee
    HAVING is_20_pfas = 1
)

-- 3 : Agrégation finale des résultats en une seule ligne par udi / année
SELECT
    cdreseau,
    annee,
    'pfas' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    SUM(
        CASE
            WHEN
                nb_pfas_above_limit > 0
                THEN 1
            ELSE 0
        END
    ) AS nb_depassements_vs,
    ROUND((
        SUM(
            CASE
                WHEN
                    nb_pfas_above_limit > 0
                    THEN 1
                ELSE 0
            END
        )
        /
        COUNT(DISTINCT referenceprel)
    ), 2) AS ratio_depassements_vs,
    SUM(CASE WHEN sum_20_pfas >= 0.1 THEN 1 ELSE 0 END)
        AS nb_depassements_20_pfas,
    ROUND((
        SUM(CASE WHEN sum_20_pfas >= 0.1 THEN 1 ELSE 0 END)
        /
        COUNT(DISTINCT referenceprel)
    ), 2) AS ratio_depassements_20_pfas,
    SUM(CASE WHEN sum_4_pfas >= 0.1 THEN 1 ELSE 0 END)
        AS nb_depassements_4_pfas,
    ROUND((
        SUM(CASE WHEN sum_4_pfas >= 0.1 THEN 1 ELSE 0 END)
        /
        COUNT(DISTINCT referenceprel)
    ), 2) AS ratio_depassements_4_pfas
FROM pfas_results_udi_agg
GROUP BY cdreseau, annee
