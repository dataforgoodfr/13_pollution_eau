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
        AND dernier_prel_datetime = '2025-01-21 12:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000260'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-06 12:02:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000268'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-01-13 09:57:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '002000060'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-10-18 08:50:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '095000346'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-27 08:35:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '973000028'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2024-12-02 11:30:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '008000681'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-12 11:38:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '008000546'
        AND categorie = 'nitrate'
        AND dernier_prel_datetime = '2025-02-07 10:38:00'
        AND resultat != 'sup_limite_qualite'
    )
