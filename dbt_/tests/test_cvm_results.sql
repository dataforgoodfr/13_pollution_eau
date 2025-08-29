-- dernier relevé
SELECT
    'dernier relevé' AS periode,
    cdreseau,
    categorie,
    resultat,
    0 AS nb_depassements,
    0 AS nb_prelevements,
    0 AS ratio_limite_qualite
FROM
    {{ ref('int__resultats_cvm_udi_dernier') }}
WHERE
    (
        cdreseau = '976003489'
        AND categorie = 'cvm'
        AND date_dernier_prel = '2024-07-16 08:30:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000241'
        AND categorie = 'cvm'
        AND date_dernier_prel = '2024-12-31 14:00:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '087003637'
        AND categorie = 'cvm'
        AND date_dernier_prel = '2024-07-04 10:50:00'
        AND resultat != 'cvm_sup_0_5'
    )
    OR
    (
        cdreseau = '095004048'
        AND categorie = 'cvm'
        AND date_dernier_prel = '2024-07-23 08:26:00'
        AND resultat != 'inf_limites'
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
    ratio_limite_qualite
FROM
    {{ ref('int__resultats_cvm_udi_annuel') }}
WHERE
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND ratio_limite_qualite != 0
    )
    OR
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2023'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '001001073'
        AND categorie = 'cvm'
        AND annee = '2022'
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '007000088'
        AND categorie = 'cvm'
        AND annee IN ('2022', '2023', '2024')
        AND nb_depassements != 0
    )
    OR
    (
        cdreseau = '095004048'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND nb_prelevements != 21
    )
    OR
    (
        cdreseau = '005001358'
        AND categorie = 'cvm'
        AND annee = '2022'
        AND nb_depassements != 2
    )
    OR
    (
        cdreseau = '032000209'
        AND categorie = 'cvm'
        AND annee = '2024'
        AND (
            ratio_limite_qualite != 0.25
            OR
            nb_prelevements != 4
        )
    )
