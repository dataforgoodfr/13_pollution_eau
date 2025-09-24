WITH
periodes AS (
    SELECT unnest(ARRAY[
        'bilan_annuel_2020',
        'bilan_annuel_2021',
        'bilan_annuel_2022',
        'bilan_annuel_2023',
        'bilan_annuel_2024',
        'bilan_annuel_2025',
        'dernier_prel'
    ]) AS periode
),

categories AS (
    SELECT unnest(ARRAY[
        'cvm',
        'pfas',
        'sub_indus_perchlorate',
        -- Les résultats pour le 1,4 dioxane sont ignorés pour l'instant
        --'sub_indus_14dioxane',
        'pesticide',
        'sub_active',
        'metabolite',
        'metabolite_esa_metolachlore',
        'metabolite_chlorothalonil_r471811',
        'metabolite_chloridazone_desphenyl',
        'metabolite_chloridazone_methyl_desphenyl',
        'metabolite_atrazine_desethyl',
        --'metaux_lourds_as',
        --'metaux_lourds_pb',
        'nitrate',
        'tous'
    ]) AS categorie
),

cog_communes AS (
    SELECT
        com AS commune_code_insee,
        libelle AS commune_nom
    FROM {{ ref("stg_communes__cog") }}
    WHERE typecom = 'COM'
),

-- Cross join to ensure all combinations exist
communes_periodes_categories AS (
    SELECT
        cog.commune_code_insee,
        cog.commune_nom,
        p.periode,
        categories.categorie
    FROM
        cog_communes AS cog
    CROSS JOIN
        periodes AS p
    CROSS JOIN
        categories
),

-- Append results from 'tous' category (in another model to avoid circular dependency)
results AS (
    SELECT
        inseecommune,
        periode,
        categorie,
        resultat,
        ratio,
        date_dernier_prel,
        nb_parametres,
        nb_prelevements,
        nb_sup_valeur_sanitaire,
        parametres_detectes
    FROM {{ ref('int__union_resultats_commune') }}
    UNION ALL
    SELECT
        inseecommune,
        periode,
        categorie,
        null AS resultat,
        ratio,
        null AS date_dernier_prel,
        null AS nb_parametres,
        nb_prelevements,
        nb_sup_valeur_sanitaire,
        null AS parametres_detectes
    FROM {{ ref('int__resultats_tous_commune_annuel') }}
    UNION ALL
    SELECT
        inseecommune,
        periode,
        categorie,
        resultat,
        null AS ratio,
        date_dernier_prel,
        nb_parametres,
        null AS nb_prelevements,
        null AS nb_sup_valeur_sanitaire,
        null AS parametres_detectes
    FROM {{ ref('int__resultats_tous_commune_dernier') }}
)

-- Final output with all inseecommune-periodes-categories combinations
SELECT
    cpc.commune_code_insee,
    cpc.commune_nom,
    cpc.periode,
    cpc.categorie,
    r.resultat,
    r.ratio,
    r.date_dernier_prel,
    r.nb_parametres,
    r.nb_prelevements,
    r.nb_sup_valeur_sanitaire,
    r.parametres_detectes
FROM
    communes_periodes_categories AS cpc
LEFT JOIN
    results AS r
    ON
        cpc.commune_code_insee = r.inseecommune
        AND cpc.periode = r.periode
        AND cpc.categorie = r.categorie
ORDER BY
    cpc.commune_code_insee,
    cpc.periode,
    r.categorie
