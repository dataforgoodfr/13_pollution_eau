-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_pesticide_udi_dernier') }}
WHERE
    (
        cdreseau = '001000277'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '061000423'
        AND dernier_prel_datetime = TIMESTAMP '2025-03-13 08:44:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '063001557'
        AND dernier_prel_datetime = TIMESTAMP '2025-03-28 09:32:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '089000445'
        AND dernier_prel_datetime = TIMESTAMP '2025-03-28 09:19:00'
        AND resultat != 'sup_limite_qualite'
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
