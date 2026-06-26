-- dernier prélèvement
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS nb_prelevements,
    0 AS nb_depassements
FROM
    {{ ref('int__resultats_metabolite_np_udi_dernier') }}
WHERE
    (
        cdreseau = '027000346'
        AND date_dernier_prel = TIMESTAMP '2026-01-19 11:45:00'
        AND resultat != 'sup_limite_indicative'
    )
    OR
    (
        cdreseau = '010000150'
        AND date_dernier_prel = TIMESTAMP '2026-03-23 10:04:00'
        AND resultat != 'inf_limites_sup_0_1'
    )
    OR
    (
        cdreseau = '045000491'
        AND date_dernier_prel = TIMESTAMP '2025-06-25 10:23:00'
        AND resultat != 'inf_limites'
    )
    OR
    (
        cdreseau = '051000766'
        AND date_dernier_prel = TIMESTAMP '2026-03-23 12:03:00'
        AND resultat != 'non_quantifie'
    )
UNION ALL
-- bilan annuel (limite_qualite est NULL pour les métabolites non pertinents,
-- donc nb_depassements et ratio_limite_qualite restent toujours à 0 :
-- on valide essentiellement le comptage des prélèvements)
SELECT
    periode,
    cdreseau,
    '' AS resultat,
    nb_prelevements,
    nb_depassements
FROM
    {{ ref('int__resultats_metabolite_np_udi_annuel') }}
WHERE
    (
        cdreseau = '067006130'
        AND annee = 2024
        AND (
            nb_prelevements != 69
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '067001945'
        AND annee = 2025
        AND (
            nb_prelevements != 11
            OR nb_depassements != 0
            OR ratio_limite_qualite != 0
        )
    )
    OR
    (
        cdreseau = '079000210'
        AND annee = 2024
        AND (
            nb_prelevements != 12
            OR nb_depassements != 0
            OR ratio_limite_qualite != 0
        )
    )
