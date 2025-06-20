-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_metabolite_udi_dernier') }}
WHERE
    (
        cdreseau = '079000210'
        AND date_dernier_prel = TIMESTAMP '2025-03-25 08:19:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '051000766'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 10:15:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '076000522'
        AND date_dernier_prel = TIMESTAMP '2025-03-25 12:50:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '051000773'
        AND date_dernier_prel = TIMESTAMP '2025-03-28 10:28:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '088001327'
        AND date_dernier_prel = TIMESTAMP '2025-03-31 13:42:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        -- cet exemple contient des val_traduite null
        cdreseau = '023000170'
        AND date_dernier_prel = TIMESTAMP '2025-03-24 10:33:00'
        AND resultat != 'non_quantifie'
    )
-- annuel udi
-- UNION ALL
-- SELECT
--     'bilan_annuel' AS periode,
--     cdreseau,
--     '' AS resultat,
--     ratio_limite_qualite,
--     nb_sup_valeur_sanitaire
-- FROM
