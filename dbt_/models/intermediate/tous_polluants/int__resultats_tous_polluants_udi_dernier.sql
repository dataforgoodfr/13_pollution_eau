SELECT
    cdreseau,
    'tous' AS categorie,
    'dernier_prel' AS periode,
    MAX(dernier_prel_datetime) AS dernier_prel_datetime,
    SUM(nb_parametres) AS nb_parametres,
    CASE
        WHEN BOOL_OR(resultat IN (
            'sup_0_5',
            'sup_valeur_sanitaire',
            'sup_valeur_sanitaire_2'
        )) THEN 'sup_limite_sanitaire'

        WHEN BOOL_OR(resultat IN (
            'inf_limite_qualite_sup_0_1',
            'somme_20pfas_sup_0_1',
            'somme_20pfas_inf_0_1_et_4pfas_sup_0_02',
            'sup_limite_qualite'
        )) THEN 'sup_limite_qualite'

        WHEN BOOL_AND(resultat IN (
            'non_quantifie',
            'inf_valeur_sanitaire',
            'inf_limite_qualite',
            'somme_20pfas_inf_0_1_et_4pfas_inf_0_02',
            'inf_0_5'
        )) THEN 'inf_limites'

        ELSE 'erreur'
    END AS resultat

FROM {{ ref('int__union_resultats_udi') }}
WHERE periode = 'dernier_prel'
GROUP BY cdreseau
