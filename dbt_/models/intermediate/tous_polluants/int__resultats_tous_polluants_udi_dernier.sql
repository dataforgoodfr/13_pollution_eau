SELECT
    cdreseau,
    periode,
    MAX(dernier_prel_datetime) AS dernier_prel_datetime,

    CASE
        WHEN BOOL_OR(resultat IN (
            'sup_0_5',
            'un_pfas_sup_valeur_sanitaire',
            'sup_valeur_sanitaire',
            'sup_valeur_sanitaire_2'
        )) THEN 'min_1_parametre_sup_limite_sanitaire'

        WHEN BOOL_OR(resultat IN (
            'somme_20pfas_sup_0_1',
            'somme_20pfas_inf_0_1_et_4pfas_sup_0_02',
            'sup_limite_qualite'
        )) THEN 'min_1_parametre_sup_limite_qualite'

        WHEN BOOL_AND(resultat IN (
            'non_quantifie',
            'aucun_parametre_quantifie',
            'inf_valeur_sanitaire',
            'somme_20pfas_inf_0_1_et_4pfas_inf_0_02',
            'inf_0_5'
        )) THEN 'inf_limites'

        ELSE 'erreur'
    END AS resultat_all

FROM {{ ref('int__union_resultats_udi') }}
WHERE periode = 'dernier_prel'
GROUP BY cdreseau, periode
