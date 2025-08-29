-- dernier relevé
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    resultat
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
        cdreseau = '976003881'
        AND date_dernier_prel = '2025-05-22 12:12:00'
        AND resultat != 'inf_limites'
    )
    OR
    (
        cdreseau = '088002246'
        AND date_dernier_prel = '2025-04-22 08:11:00'
        AND resultat != 'sup_limite_sanitaire'
    )
