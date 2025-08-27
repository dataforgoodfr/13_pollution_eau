-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_pesticide_udi_dernier') }}
WHERE
    (
        cdreseau = '001000277'
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '061000423'
        AND date_dernier_prel = TIMESTAMP '2025-06-16 12:30:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '063001557'
        AND date_dernier_prel = TIMESTAMP '2025-03-28 09:32:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '089000445'
        AND date_dernier_prel = TIMESTAMP '2025-03-28 09:19:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '034000996'
        AND date_dernier_prel = TIMESTAMP '2025-06-20 09:27:00'
        AND resultat != 'sup_limite_qualite'
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
    {{ ref('int__resultats_pesticide_udi_annuel') }}
WHERE
    (
        cdreseau = '001000277'
        AND annee = 2024
        AND (
            nb_prelevements != 2
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '061000423'
        AND annee = 2024
        AND (
            nb_prelevements != 12
            OR nb_depassements != 12
            OR nb_sup_valeur_sanitaire != 12
            OR ratio_limite_qualite != 1.0
        )
    )
    OR
    (
        cdreseau = '061000423'
        AND annee = 2023
        AND (
            nb_prelevements != 13
            OR nb_depassements != 13
            OR nb_sup_valeur_sanitaire != 4
            OR ratio_limite_qualite != 1.0
        )
    )
    OR
    (
        cdreseau = '089000445'
        AND annee = 2023
        AND (
            nb_prelevements != 1
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
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
    OR
    (
        -- cas particulier où le PESTOT est le seul paramètre qui dépasse la limite de qualité
        -- (regarder la date de 2024-04-10 09:06:00)
        cdreseau = '059000619'
        AND annee = 2024
        AND (
            nb_prelevements != 6
            OR nb_depassements != 4
            OR nb_sup_valeur_sanitaire != 0
        )
    )
