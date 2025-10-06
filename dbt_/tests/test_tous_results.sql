-- dernier relevé
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    categorie,
    resultat,
    null AS ratio,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_tous_udi_dernier') }}
WHERE
    (
        cdreseau = '001000598'
        AND date_dernier_prel = '2025-03-26 10:59:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '049000506'
        AND date_dernier_prel = '2025-07-08 08:30:00'
        AND resultat != 'quantifie'
    )
    OR
    (
        cdreseau = '033000400'
        AND date_dernier_prel = '2025-07-17 09:50:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '088002246'
        AND date_dernier_prel = '2025-04-22 08:11:00'
        AND resultat != 'sup_limite_sanitaire'
    )
UNION ALL
-- annuel
SELECT
    periode,
    cdreseau,
    categorie,
    null AS resultat,
    ratio,
    nb_prelevements,
    nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_tous_udi_annuel') }}
WHERE
    (
        cdreseau = '054000780'
        AND periode = 'bilan_annuel_2024'
        AND (
            nb_prelevements != 7
            -- cvm : 1
            -- metaux_lourds_as : 1
            -- nitrate : 5
            -- pesticide : 1
            OR
            ratio != 0
            OR
            nb_sup_valeur_sanitaire != 0
        )
    )
    OR
    (
        cdreseau = '061000423'
        AND periode = 'bilan_annuel_2024'
        AND (
            nb_prelevements != 27
            -- cvm: 1
            -- metaux_lourds_as: 1
            -- nitrate: 14
            -- pesticide: 12
            OR
            ratio <= 0.4
            OR
            ratio >= 0.5
            -- ratio = 12/28 ~= 0.42
            OR
            nb_sup_valeur_sanitaire != 0
        )
    )
