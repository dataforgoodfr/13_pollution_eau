SELECT *
FROM {{ ref('int__resultats_pfas_udi_dernier') }}
WHERE
    (
    -- test n°1
    -- l'UDI 013001457 a un prélevement le 2025-01-21 09:40:00
    -- avec un dépassement de valeur sanitaire pour PFOS
        cdreseau = '013001457'
        AND last_datetimeprel = TIMESTAMP '2025-01-21 09:40:00'
        AND resultat != 'un_pfas_sup_valeur_sanitaire'
    )
