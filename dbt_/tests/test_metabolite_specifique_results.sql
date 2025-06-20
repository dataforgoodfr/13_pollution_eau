-- dernier udi
SELECT
    'dernier_prel' AS periode,
    cdreseau,
    categorie,
    resultat,
    0 AS ratio_limite_qualite,
    0 AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_metabolite_specifique_udi_dernier') }}
WHERE
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chloridazone_desphenyl'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_esa_metolachlore'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_atrazine_desethyl'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'inf_limite_qualite'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chloridazone_methyl_desphenyl'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND dernier_prel_datetime = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000589'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-12 11:17:00'
        AND resultat != 'inf_limite_qualite_sup_0_1'
    )
    OR
    (
        cdreseau = '001000589'
        AND categorie = 'metabolite_esa_metolachlore'
        AND dernier_prel_datetime = TIMESTAMP '2025-02-12 11:17:00'
        AND resultat != 'sup_limite_qualite'
    )
    OR
    (
        cdreseau = '002000074'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND dernier_prel_datetime = TIMESTAMP '2024-11-25 09:29:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
-- annuel udi
UNION ALL
SELECT
    'bilan_annuel' AS periode,
    cdreseau,
    categorie,
    '' AS resultat,
    ratio_limite_qualite,
    nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_metabolite_specifique_udi_annuel') }}
WHERE
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chloridazone_desphenyl'
        AND annee = 2024
        AND (ratio_limite_qualite != 0 OR nb_depassements != 0)
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_esa_metolachlore'
        AND annee = 2024
        AND ratio_limite_qualite <= 0
    )
    OR
    (
        cdreseau = '002000074'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND annee = 2024
        AND nb_sup_valeur_sanitaire <= 0
    )
