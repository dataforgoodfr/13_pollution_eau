SELECT *
FROM {{ ref('int__resultats_pfas_udi_dernier') }}
WHERE
    (
    -- test n°1
    -- l'UDI 013001457 a un prélevement le 2025-02-19 09:58:00
    -- avec un dépassement de valeur sanitaire pour PFOS
        cdreseau = '013001457'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-19 09:58:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
    OR (
    -- test n°2
        cdreseau = '003000370'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-18 08:45:00'
        AND resultat != 'non_quantifie'
    )
    OR (
    -- test n°3
        cdreseau = '004001032'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-28 12:33:00'
        AND resultat != 'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
    )
    OR (
    -- test n°4
        cdreseau = '008000855'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-27 09:24:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
