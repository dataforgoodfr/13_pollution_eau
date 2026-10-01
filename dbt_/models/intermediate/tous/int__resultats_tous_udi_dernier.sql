SELECT
    cdreseau,
    'tous' AS categorie,
    'dernier_prel' AS periode,
    MAX(date_dernier_prel) AS date_dernier_prel,
    SUM(nb_parametres) AS nb_parametres,
    CASE
        -- Dépassement d'une valeur sanitaire : selon le polluant, l'eau est
        -- déconseillée à toute la population (pesticides, PFAS) ou seulement
        -- aux personnes sensibles (nitrates et perchlorate : nourrissons,
        -- femmes enceintes...). Le cas "toute la population" l'emporte.
        WHEN BOOL_OR(
            categorie IN ('pesticide', 'pfas')
            AND resultat = 'sup_valeur_sanitaire'
        ) THEN 'deconseille_population'

        WHEN BOOL_OR(
            (categorie = 'nitrate' AND resultat = 'sup_valeur_sanitaire')
            OR (
                categorie = 'sub_indus_perchlorate'
                AND resultat IN (
                    'sup_valeur_sanitaire',
                    'sup_valeur_sanitaire_2'
                )
            )
        ) THEN 'deconseille_sensibles'

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

FROM {{ ref('int__union_resultats_udi') }}
WHERE
    periode = 'dernier_prel'
    AND
    categorie NOT IN (
        'pes_total_reg',
        'pes_total_ts',
        'sub_active',
        'metabolite_np',
        'metabolite_p',
        'metabolite_esa_metolachlore',
        'metabolite_chlorothalonil_r471811',
        'metabolite_chloridazone_desphenyl',
        'metabolite_chloridazone_methyl_desphenyl',
        'metabolite_atrazine_desethyl',
        'tfa'
    )
GROUP BY cdreseau
