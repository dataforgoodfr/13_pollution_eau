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
    {{ ref('int__resultats_sub_indus_udi_dernier') }}
WHERE
    (
        cdreseau = '002000045'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-10-22 09:58:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '002000048'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-04-22 10:10:00'
        AND resultat != 'inf_4'
    )
    OR
    (
        cdreseau = '002000060'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-10-18 08:31:00'
        AND resultat != 'sup_4'
    )
    OR
    (
        cdreseau = '002000114'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-10-10 11:03:00'
        AND resultat != 'sup_15'
    )
    OR
    (
        cdreseau = '052000760'
        AND categorie = 'sub_indus_14DAN'
        AND dernier_prel_datetime = '2024-12-13 14:52:00'
        AND resultat != 'sup_0_35'
    )
    OR
    (
        cdreseau = '076000543'
        AND categorie = 'sub_indus_14DAN'
        AND dernier_prel_datetime = '2024-11-05 10:15:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '080001512'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-05-02 14:30:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '080003913'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-05-31 11:23:00'
        AND resultat != 'inf_4'
    )
    OR
    (
        cdreseau = '080003918'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-10-23 13:09:00'
        AND resultat != 'sup_15'
    )
    OR
    (
        cdreseau = '088002246'
        AND categorie = 'sub_indus_PCLAT'
        AND dernier_prel_datetime = '2024-10-22 10:33:00'
        AND resultat != 'sup_4'
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
    {{ ref('int__resultats_sub_indus_udi_annuel') }}
WHERE
    (
        cdreseau = '068006326'
        AND categorie = 'sub_indus_PCLAT'
        AND annee = '2020'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '002001026'
        AND categorie = 'sub_indus_PCLAT'
        AND annee = '2021'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '062000680'
        AND categorie = 'sub_indus_PCLAT'
        AND annee = '2022'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '028001088'
        AND categorie = 'sub_indus_PCLAT'
        AND annee = '2023'
        AND (
            nb_prelevements != 28
            OR nb_depassements != 11
        )
    )
    OR
    (
        cdreseau = '052000760'
        AND categorie = 'sub_indus_14DAN'
        AND annee = '2024'
        AND (
            nb_prelevements != 1
            OR nb_depassements != 1
        )
    )
    OR
    (
        cdreseau = '076000543'
        AND categorie = 'sub_indus_14DAN'
        AND annee IN ('2022', '2023')
        AND nb_prelevements != 12
    )
    OR
    (
        cdreseau = '076000543'
        AND categorie = 'sub_indus_14DAN'
        AND annee = '2024'
        AND nb_prelevements != 9
    )
    OR
    (
        cdreseau = '088002246'
        AND categorie = 'sub_indus_PCLAT'
        AND annee = '2022'
        AND (
            ratio_depassements != 0.5
            OR
            nb_prelevements != 2
        )
    )
