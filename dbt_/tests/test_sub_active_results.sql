-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_sub_active_udi_dernier') }}
WHERE
    (
        cdreseau = '051000769'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 13:58:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '030000509'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 11:56:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '029000947'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 11:00:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '060001302'
        AND date_dernier_prel = TIMESTAMP '2024-12-19 08:29:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
-- annuel udi
UNION ALL
SELECT
    'bilan_annuel' AS periode,
    cdreseau,
    '' AS resultat,
    ratio_limite_qualite,
    nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_sub_active_udi_annuel') }}
WHERE
    (
        cdreseau = '051000769'
        AND annee = 2024
        AND (
            nb_prelevements != 6
            OR nb_depassements != 3
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.5
        )
    )
    OR
    (
        cdreseau = '030000509'
        AND annee = 2024
        AND (
            nb_prelevements != 7
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '060001302'
        AND annee = 2024
        AND (
            nb_prelevements != 4
            OR nb_depassements != 2
            OR nb_sup_valeur_sanitaire != 1
            OR ratio_limite_qualite != 0.5
        )
    )
