-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    categorie,
    resultat,
    0 AS ratio_depassements_limite_reg,
    0 AS resultat_limite_sanitaire
FROM
    {{ ref('int__resultats_pfas_udi_dernier') }}
WHERE
    (
    -- test
    -- l'UDI 013001457 a un prélevement le 2025-02-19 09:58:00
    -- avec un dépassement de valeur sanitaire pour PFOS
        cdreseau = '013001457'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-19 09:58:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR (
        cdreseau = '004001032'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-28 12:33:00'
        AND resultat != 'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
    )
    OR (
        cdreseau = '008000855'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-27 09:24:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '00800107747'
        AND dernier_prel_datetime = '2025-02-27 09:24:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '011004114'
        AND dernier_prel_datetime = '2025-02-24 13:55:00'
        AND resultat != 'somme_20pfas_sup_0_1'
    )
    OR
    (
        cdreseau = '001000404'
        AND dernier_prel_datetime = '2024-11-29 08:08:00'
        AND resultat != 'somme_20pfas_inf_0_1_et_4pfas_sup_0_02'
    )
    OR
    (
        cdreseau = '001000511'
        AND dernier_prel_datetime = '2024-11-28 09:58:00'
        AND resultat != 'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
    )
    OR
    (
        cdreseau = '003000370'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-18 08:45:00'
        AND resultat != 'non_quantifie'
    )
UNION ALL
-- annuel udi
SELECT
    'bilan_annuel' AS periode,
    cdreseau,
    categorie,
    '' AS resultat,
    ratio_depassements_limite_reg,
    resultat_limite_sanitaire
FROM
    int__resultats_pfas_udi_annuel
WHERE
    (
        cdreseau = '001000356'
        AND categorie = 'pfas'
        AND annee = '2025'
        AND ratio_depassements_limite_reg = 0
        AND resultat_limite_sanitaire != 'aucun_pfas_sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '074000043'
        AND categorie = 'pfas'
        AND annee = '2022'
        AND ratio_depassements_limite_reg = 0.1
        AND resultat_limite_sanitaire != 'min_1_pfas_sup_valeur_sanitaire'
    )
    OR
    (
        cdreseau = '030000200'
        AND categorie = 'pfas'
        AND annee = '2024'
        AND resultat_limite_sanitaire = 'aucun_pfas_sup_valeur_sanitaire'
        AND ratio_depassements_limite_reg != 0.25
    )
    OR
    (
        cdreseau = '069000025'
        AND categorie = 'pfas'
        AND annee IN ('2022', '2023', '2024')
        AND resultat_limite_sanitaire = 'aucun_pfas_sup_valeur_sanitaire'
        AND ratio_depassements_limite_reg != 0
    )
