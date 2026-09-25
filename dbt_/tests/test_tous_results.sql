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
