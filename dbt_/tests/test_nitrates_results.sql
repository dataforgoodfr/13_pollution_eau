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
        AND dernier_prel_datetime = '2025-01-21 12:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000260'
        AND dernier_prel_datetime = '2024-12-06 12:02:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000268'
        AND dernier_prel_datetime = '2025-01-13 09:57:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '002000060'
        AND dernier_prel_datetime = '2024-10-18 08:50:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '095000346'
        AND dernier_prel_datetime = '2025-02-27 08:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '973000028'
        AND dernier_prel_datetime = '2024-12-02 11:30:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '008000681'
        AND dernier_prel_datetime = '2025-02-12 11:38:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '008000546'
        AND dernier_prel_datetime = '2025-02-07 10:38:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '011000196'
        AND dernier_prel_datetime = '2024-11-27 10:57:00'
        AND resultat != 'inf_limite_qualite'
    )
UNION ALL
-- annuel
SELECT
    'annuel' AS periode,
    cdreseau,
    categorie,
    '' AS resultat,
    nb_depassements,
    nb_prelevements,
    ratio_limite_sanitaire
FROM
    {{ ref('int__resultats_nitrites_udi_annuel') }}
WHERE
    (
        cdreseau = '092003070'
        AND categorie = 'nitrate'
        AND annee = '2024'
        AND (
            nb_prelevements != 806
            OR nb_depassements != 0
        )
    )
    OR
    (
        cdreseau = '071001155'
        AND categorie = 'nitrate'
        AND annee = '2023'
        AND (
            nb_prelevements != 1
            OR nb_depassements != 0
        )
    )
    OR
    (
        cdreseau = '036000670'
        AND categorie = 'nitrate'
        AND annee = '2024'
        AND (
            nb_prelevements != 27
            OR nb_depassements != 27
        )
    )
    OR
    (
        cdreseau = '092003070'
        AND categorie = 'nitrate'
        AND annee IN (2020, 2021, 2022, 2023, 2024, 2025)
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '089003503'
        AND categorie = 'nitrate'
        AND annee = '2020'
        AND (
            nb_prelevements != 12
            OR nb_depassements != 3
        )
    )
