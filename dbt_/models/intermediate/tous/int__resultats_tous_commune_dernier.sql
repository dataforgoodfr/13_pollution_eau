SELECT
    inseecommune,
    'tous' AS categorie,
    'dernier_prel' AS periode,
    MAX(date_dernier_prel) AS date_dernier_prel,
    SUM(nb_parametres) AS nb_parametres,
    CASE
        WHEN BOOL_OR(resultat IN (
            'sup_valeur_sanitaire',
            'sup_valeur_sanitaire_2'
        )) THEN 'sup_limite_sanitaire'

        WHEN BOOL_OR(resultat IN (
            'cvm_sup_0_5',
            'somme_20pfas_sup_0_1',
            'sup_limite_qualite'
        )) THEN 'sup_limite_qualite'

        WHEN BOOL_OR(resultat IN (
            'inf_valeur_sanitaire',
            'inf_limite_qualite',
            -- 'inf_limites_sup_0_1',
            --'sup_limite_indicative',
            'inf_limites',
            'somme_20pfas_inf_0_1_et_4pfas_sup_0_02',
            'somme_20pfas_inf_0_1_et_4pfas_inf_0_02',
            'sup_limite_qualite_2036',
            'no3_inf_25',
            'no3_inf_40'

        )) THEN 'quantifie'

        WHEN BOOL_AND(resultat IN (
            'non_quantifie'
        )) THEN 'non_quantifie'

        ELSE 'erreur'
    END AS resultat

FROM {{ ref('int__union_resultats_commune') }}
WHERE
    periode = 'dernier_prel'
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
GROUP BY inseecommune
