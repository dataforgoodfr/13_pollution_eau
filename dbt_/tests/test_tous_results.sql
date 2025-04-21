-- dernier relevé
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat
FROM
    {{ ref('int__resultats_tous_udi_dernier') }}
WHERE
    (
        cdreseau = '001000404'
        AND dernier_prel_datetime = '2025-01-21 12:12:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '976003881'
        AND dernier_prel_datetime = '2024-06-18 10:21:00'
        AND resultat != 'inf_limites'
    )
    OR
    (
        cdreseau = '088002246'
        AND dernier_prel_datetime = '2024-10-22 10:33:00'
        AND resultat != 'sup_limite_sanitaire'
    )
