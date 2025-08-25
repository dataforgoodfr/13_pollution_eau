-- dernier relevé
SELECT
    'dernier relevé' AS periode,
    cdreseau,
    resultat,
    0 AS nb_depassements,
    0 AS nb_prelevements,
    0 AS ratio_depassements
FROM
    {{ ref('int__resultats_nitrate_udi_dernier') }}
WHERE
    (
        cdreseau = '001000003'
        AND date_dernier_prel = '2025-05-23 09:06:00'
        AND resultat != 'no3_inf_25'
    )
    OR
    (
        cdreseau = '037000175'
        AND date_dernier_prel = '2025-06-17 10:02:00'
        AND resultat != 'no3_inf_40'
    )
    OR
    (
        cdreseau = '002000060'
        AND date_dernier_prel = '2025-04-10 09:22:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '060001271'
        AND date_dernier_prel = '2025-04-09 13:44:00'
        AND resultat != 'inf_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '973000028'
        AND date_dernier_prel = '2025-05-20 10:44:00'
        AND resultat != 'non_quantifie'
    )
UNION ALL
-- annuel
SELECT
    'annuel' AS periode,
    cdreseau,
    '' AS resultat,
    nb_depassements,
    nb_prelevements,
    ratio
FROM
    {{ ref('int__resultats_nitrate_udi_annuel') }}
WHERE
    (
        cdreseau = '092003070'
        AND annee = '2024'
        AND (
            nb_prelevements != 806
            OR nb_depassements != 0
            OR ratio != 0
        )
    )
    OR
    (
        cdreseau = '071001155'
        AND annee = '2023'
        AND (
            nb_prelevements != 1
            OR nb_depassements != 0
            OR ratio != 0
        )
    )
    OR
    (
        cdreseau = '036000670'
        AND annee = '2024'
        AND (
            nb_prelevements != 27
            OR nb_depassements != 25
            -- il y a 2 prélèvements = à 50 (= valeur_sanitaire_1)
            -- comme c'est un strict > dans la requête, on a 25 et pas 27
            OR ratio < 0.92
        )
    )
    OR
    (
        cdreseau = '089003503'
        AND annee = '2020'
        AND (
            nb_prelevements != 12
            OR nb_depassements != 3
            OR ratio != 0.25
        )
    )
    OR
    (
        cdreseau = '055000713'
        AND annee = '2023'
        AND (
            nb_prelevements != 4
            OR nb_depassements != 0
            OR ratio != 0
        )
    )
    OR
    (
        cdreseau = '027000943'
        AND annee = '2021'
        AND (
            nb_prelevements != 63
            OR nb_depassements != 1
            -- il y a 1 prélèvement = à 50 (= valeur_sanitaire_1)
        )
    )
