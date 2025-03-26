-- dernier relevé
SELECT
    'dernier relevé' AS periode,
    cdreseau,
    categorie,
    resultat
FROM
    int__resultats_cvm_udi_dernier
WHERE
    (
        cdreseau = '976003489'
        AND categorie = 'cvm'
        AND last_datetimeprel = '2024-07-16 08:30:00'
        AND resultat != 'non quantifié'
    )
    OR
    (
        cdreseau = '001000241'
        AND categorie = 'cvm'
        AND last_datetimeprel = '2024-12-31 14:00:00'
        AND resultat != 'non quantifié'
    )
    OR
    (
        cdreseau = '087003637'
        AND categorie = 'cvm'
        AND last_datetimeprel = '2024-07-04 10:50:00'
        AND resultat != '>= 0,5 µg/L'
    )
    OR
    (
        cdreseau = '095004048'
        AND categorie = 'cvm'
        AND last_datetimeprel = '2024-07-23 08:26:00'
        AND resultat != '< 0,5 µg/L'
    )
UNION ALL
-- annuel
SELECT
    'annuel' AS periode,
    cdreseau,
    categorie,
    resultat
FROM
    int__resultats_cvm_udi_annuel
WHERE
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND resultat != '>= 0,5 µg/L'
    )
    OR
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2023'
        AND resultat != 'non quantifié'
    )
    OR
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2022'
        AND resultat != '< 0,5 µg/L'
    )
    OR
    (
        cdreseau = '007000088'
        AND categorie = 'cvm'
        AND annee IN ('2022', '2023', '2024')
        AND resultat != 'non quantifié'
    )
    OR
    (
        cdreseau = '095004048'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND resultat != '< 0,5 µg/L'
    )
