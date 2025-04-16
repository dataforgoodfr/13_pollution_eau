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
        'sub_indus_14dioxane'
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
)

-- Final output with all combinations
SELECT
    cpc.commune_code_insee,
    cpc.commune_nom,
    cpc.periode,
    cpc.categorie,
    r.resultat,
    r.ratio,
    r.dernier_prel_datetime,
    r.dernier_prel_valeur,
    r.nb_parametres,
    r.nb_prelevements,
    r.nb_sup_valeur_sanitaire
FROM
    communes_periodes_categories AS cpc
LEFT JOIN
    {{ ref('int__union_resultats_commune') }} AS r
    ON
        cpc.commune_code_insee = r.inseecommune
        AND cpc.periode = r.periode
        AND cpc.categorie = r.categorie
ORDER BY
    cpc.commune_code_insee,
    cpc.periode,
    r.categorie
