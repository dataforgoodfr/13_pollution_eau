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
        AND date_dernier_prel = '2025-01-21 12:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000260'
        AND date_dernier_prel = '2024-12-06 12:02:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000268'
        AND date_dernier_prel = '2025-01-13 09:57:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '002000060'
        AND date_dernier_prel = '2024-10-18 08:50:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '095000346'
        AND date_dernier_prel = '2025-02-27 08:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '973000028'
        AND date_dernier_prel = '2024-12-02 11:30:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '008000681'
        AND date_dernier_prel = '2025-02-12 11:38:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '008000546'
        AND date_dernier_prel = '2025-02-07 10:38:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '011000196'
        AND date_dernier_prel = '2024-11-27 10:57:00'
        AND resultat != 'inf_limite_qualite'
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
        )
    )
    OR
    (
        cdreseau = '036000670'
        AND annee = '2024'
        AND (
            nb_prelevements != 27
            OR nb_depassements != 27 -- depassements de N03
        )
    )
    OR
    (
        cdreseau = '089003503'
        AND annee = '2020'
        AND (
            nb_prelevements != 12 -- depassements de N03 et N03_N02
            OR nb_depassements != 3
            OR ratio != 0.25
        )
    )
    OR
    (
        cdreseau = '055000713'
        AND annee = '2023'
        AND (
            nb_prelevements != 14
            OR nb_depassements != 6 -- depassements de N02
            OR ratio < 0.42
        )
    )
    OR
    (
        cdreseau = '027000943'
        AND annee = '2021'
        AND (
            nb_prelevements != 63
            OR nb_depassements != 4 -- depassements de N03 et N03_N02
        )
    )
