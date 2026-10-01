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
        AND resultat NOT IN ('deconseille_sensibles', 'deconseille_population')
    )
    OR
    -- perchlorate entre 4 et 15 µg/L : déconseillée aux personnes sensibles
    (
        cdreseau = '088002246'
        AND date_dernier_prel = '2026-04-17 08:18:00'
        AND resultat != 'deconseille_sensibles'
    )
    OR
    -- nitrates > 50 mg/L et perchlorate > 15 µg/L : personnes sensibles
    (
        cdreseau = '062000681'
        AND date_dernier_prel = '2026-05-19 11:12:00'
        AND resultat != 'deconseille_sensibles'
    )
    OR
    -- PFAS > valeur sanitaire : déconseillée à toute la population
    (
        cdreseau = '055000741'
        AND date_dernier_prel = '2026-06-08 10:56:00'
        AND resultat != 'deconseille_population'
    )
    OR
    -- pesticide > valeur sanitaire et nitrates > 50 mg/L : le cas
    -- "toute la population" l'emporte sur "personnes sensibles"
    (
        cdreseau = '028000816'
        AND date_dernier_prel = '2026-06-17 10:13:00'
        AND resultat != 'deconseille_population'
    )
