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
        AND date_dernier_prel = TIMESTAMP '2025-10-24 10:20:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        -- total_pesticide > 0.5 sur le dernier prel
        cdreseau = '061000423'
        AND date_dernier_prel = TIMESTAMP '2026-03-10 11:05:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '043001415'
        AND date_dernier_prel = TIMESTAMP '2026-03-31 09:54:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '089000445'
        AND date_dernier_prel = TIMESTAMP '2025-12-19 10:13:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '034000996'
        AND date_dernier_prel = TIMESTAMP '2026-01-23 10:03:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        -- DTERB = 0.158 > valeur_sanitaire_1 = 0.142
        cdreseau = '007006251'
        AND date_dernier_prel = TIMESTAMP '2026-03-20 12:10:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
-- annuel udi
UNION ALL
SELECT
    periode,
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
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 1.0
        )
    )
    OR
    (
        cdreseau = '002000401'
        AND annee = 2024
        AND (
            nb_prelevements != 12
            OR nb_depassements != 12
            OR nb_sup_valeur_sanitaire != 0
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
            OR nb_sup_valeur_sanitaire != 0
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
        -- UPDATE 2026-04-22 : le PESTOT ne dépasse plus la limite de qualité suite à une MAJ
        -- de la source de donnée
        cdreseau = '059000619'
        AND annee = 2024
        AND (
            nb_prelevements != 6
            OR nb_depassements != 3
            OR nb_sup_valeur_sanitaire != 0
        )
    )
