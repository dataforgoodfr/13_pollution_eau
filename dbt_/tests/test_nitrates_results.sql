-- dernier relevé
SELECT
    'dernier relevé' AS periode,
    cdreseau,
    categorie,
    resultat,
    0 AS nb_depassements,
    0 AS nb_prelevements,
    0 AS ratio_depassements
FROM
    {{ ref('int__resultats_nitrites_udi_dernier') }}
WHERE
    (
        cdreseau = '001000003'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-26 09:08:00'
        AND resultat != 'conforme'
    )
    OR
    (
        cdreseau = '001000260'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-06 12:02:00'
        AND resultat != 'conforme'
    )
    OR
    (
        cdreseau = '001000268'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-11-28 08:25:00'
        AND resultat != 'conforme'
    )
    OR
    (
        cdreseau = '002000060'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-10-18 08:50:00'
        AND resultat != 'non_conforme'
    )
    OR
    (
        cdreseau = '073002059'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-10-23 09:28:00'
        AND resultat != 'donnee_manquante'
        AND nb_parametres = 1
    )
    OR
    (
        cdreseau = '088002296'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-09-27 12:00:00'
        AND resultat != 'donnee_manquante'
        AND nb_parametres = 1
    )
    OR
    (
        cdreseau = '095000346'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-17 08:55:00'
        AND resultat != 'non_conforme'
    )
    OR
    (
        cdreseau = '973000028'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-17 08:55:00'
        AND resultat != 'conforme'
        AND nb_parametres = 2
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
    ratio_depassements
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
