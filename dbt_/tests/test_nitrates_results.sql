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
    OR
    (
        cdreseau = '001000258'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-01-21 09:45:00'
        AND resultat != 'donnee_manquante'
        AND nb_parametres = 2
    )
    OR
    (
        cdreseau = '001000387'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-13 10:48:00'
        AND resultat != 'conforme'
        AND nb_parametres = 2
    )
    OR
    (
        cdreseau = '008000681'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-12 11:38:00'
        AND resultat != 'non_conforme'
        AND nb_parametres = 2
    )
    OR
    (
        cdreseau = '008000546'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-07 10:38:00'
        AND resultat != 'non_conforme'
        AND nb_parametres = 2
    )
