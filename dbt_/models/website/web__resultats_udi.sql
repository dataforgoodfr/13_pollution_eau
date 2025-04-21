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
        'sub_indus_14dioxane',
        'metabolite_esa_metolachlore',
        'metabolite_chlorothalonil_r471811',
        'metabolite_chloridazone_desphenyl',
        'metabolite_chloridazone_methyl_desphenyl',
        'metabolite_atrazine_desethyl',
        'tous'
    ]) AS categorie
),

udi AS (
    SELECT
        cdreseau,
        nomreseaux
    FROM
        {{ ref('int__udi') }}
),

-- Cross join to ensure all combinations exist
udi_periodes_categories AS (
    SELECT
        u.cdreseau,
        u.nomreseaux,
        p.periode,
        categories.categorie
    FROM
        udi AS u
    CROSS JOIN
        periodes AS p
    CROSS JOIN
        categories
),

-- Append results from 'tous' category (in another model to avoid circular dependency)
results AS (
    SELECT
        cdreseau,
        periode,
        categorie,
        resultat,
        ratio,
        dernier_prel_datetime,
        dernier_prel_valeur,
        nb_parametres,
        nb_prelevements,
        nb_sup_valeur_sanitaire
    FROM {{ ref('int__union_resultats_udi') }}
    UNION ALL
    SELECT
        cdreseau,
        periode,
        categorie,
        resultat,
        null AS ratio,
        dernier_prel_datetime,
        null AS dernier_prel_valeur,
        nb_parametres,
        null AS nb_prelevements,
        null AS nb_sup_valeur_sanitaire
    FROM {{ ref('int__resultats_tous_udi_dernier') }}
)

-- Final output with all UDI-periodes-categories combinations
SELECT
    upc.cdreseau,
    upc.nomreseaux,
    upc.periode,
    upc.categorie,
    r.resultat,
    r.ratio,
    r.dernier_prel_datetime,
    r.dernier_prel_valeur,
    r.nb_parametres,
    r.nb_prelevements,
    r.nb_sup_valeur_sanitaire
FROM
    udi_periodes_categories AS upc
LEFT JOIN
    results AS r
    ON
        upc.cdreseau = r.cdreseau
        AND upc.periode = r.periode
        AND upc.categorie = r.categorie
ORDER BY
    upc.cdreseau,
    upc.periode,
    r.categorie
