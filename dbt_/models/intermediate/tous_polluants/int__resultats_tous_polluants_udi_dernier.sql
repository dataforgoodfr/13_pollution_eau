SELECT
    cdreseau,
    periode,
    MAX(dernier_prel_datetime) AS dernier_prel_datetime,

    CASE
        WHEN BOOL_OR(resultat IN (
            'sup_0_5',
            'sup_valeur_sanitaire',
            'sup_valeur_sanitaire_2'
        )) THEN 'min_1_parametre_sup_limite_sanitaire'

        WHEN BOOL_OR(resultat IN (
            'inf_limite_qualite_sup_0_02',
            'inf_limite_qualite_sup_0_1'
        )) THEN 'min_1_parametre_sup_limite_reg'

        WHEN BOOL_AND(resultat IN (
            'non_quantifie',
            'inf_valeur_sanitaire',
            'inf_limite_qualite',
            'inf_0_5'
        )) THEN 'inf_limites'

        ELSE 'erreur'
    END AS resultat_all

FROM {{ ref('int__union_resultats_udi') }}
WHERE periode = 'dernier_prel'
GROUP BY cdreseau, periode
