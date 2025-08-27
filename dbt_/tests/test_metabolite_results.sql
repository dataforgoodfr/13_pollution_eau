-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_metabolite_udi_dernier') }}
WHERE
    (
        cdreseau = '079000210'
        AND date_dernier_prel = TIMESTAMP '2025-06-17 08:15:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '051000766'
        AND date_dernier_prel = TIMESTAMP '2025-04-29 12:07:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '010000150'
        AND date_dernier_prel = TIMESTAMP '2025-06-20 10:46:00'
        AND resultat != 'sup_limite_indicative'
    )
    OR
    (
        cdreseau = '051000773'
        AND date_dernier_prel = TIMESTAMP '2025-03-28 10:28:00'
        AND resultat != 'inf_limites'
    )
    OR
    (
        cdreseau = '088001327'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 13:42:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        -- cet exemple contient des val_traduite null
        cdreseau = '023000170'
        AND date_dernier_prel = TIMESTAMP '2025-03-24 10:33:00'
        AND resultat != 'non_quantifie'
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
    {{ ref('int__resultats_metabolite_udi_annuel') }}
WHERE
    (
        cdreseau = '079000210'
        AND annee = 2024
        AND (
            nb_prelevements != 20
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 11
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '051000766'
        AND annee = 2024
        AND (
            nb_prelevements != 4
            OR nb_depassements != 3
            OR nb_sup_valeur_sanitaire != 1
            OR ratio_limite_qualite != 0.75
        )
    )
    OR
    (
        cdreseau = '076000522'
        AND annee = 2024
        AND (
            nb_prelevements != 12
            OR nb_depassements != 12
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 1
        )
    )
    OR
    (
        cdreseau = '088001327'
        AND annee = 2024
        AND (
            nb_prelevements != 1
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '051000773'
        AND annee = 2024
        AND (
            nb_prelevements != 5
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '051000773'
        AND annee = 2023
        AND (
            nb_prelevements != 4
            OR nb_depassements != 2
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.5
        )
    )
