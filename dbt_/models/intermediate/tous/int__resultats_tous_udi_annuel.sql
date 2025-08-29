SELECT
    cdreseau,
    'tous' AS categorie,
    periode,
    sum(round(ratio * nb_prelevements))::float / sum(nb_prelevements)::float AS ratio,
    sum(nb_prelevements) AS nb_prelevements,
    sum(nb_sup_valeur_sanitaire) AS nb_sup_valeur_sanitaire

FROM {{ ref('int__union_resultats_udi') }}
WHERE
    periode LIKE 'bilan_annuel%'
    AND
    categorie NOT IN (
        'sub_active',
        'metabolite',
        'metabolite_esa_metolachlore',
        'metabolite_chlorothalonil_r471811',
        'metabolite_chloridazone_desphenyl',
        'metabolite_chloridazone_methyl_desphenyl',
        'metabolite_atrazine_desethyl'
    )
GROUP BY cdreseau, periode
