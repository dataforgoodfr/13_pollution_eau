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
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_esa_metolachlore'
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_atrazine_desethyl'
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'inf_limites'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chloridazone_methyl_desphenyl'
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND date_dernier_prel = TIMESTAMP '2025-01-22 11:24:00'
        AND resultat != 'non_quantifie'
    )
    OR
    (
        cdreseau = '002000557'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND date_dernier_prel = TIMESTAMP '2025-02-20 13:53:00'
        AND resultat != 'inf_limites_sup_0_1'
    )
    OR
    (
        cdreseau = '001000589'
        AND categorie = 'metabolite_esa_metolachlore'
        AND date_dernier_prel = TIMESTAMP '2025-04-28 11:39:00'
        AND resultat != 'sup_limite_indicative'
    )
    OR
    (
        cdreseau = '002000401'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND date_dernier_prel = TIMESTAMP '2025-05-05 14:23:00'
        AND resultat != 'sup_valeur_sanitaire'
    )
-- annuel udi
UNION ALL
SELECT
    periode,
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
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND annee = 2024
        AND (
            nb_prelevements != 2
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_esa_metolachlore'
        AND annee = 2024
        AND (
            nb_prelevements != 2
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '001000277'
        AND categorie = 'metabolite_atrazine_desethyl'
        AND annee = 2024
        AND (
            nb_prelevements != 2
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '001000589'
        AND categorie = 'metabolite_esa_metolachlore'
        AND annee = 2024
        AND (
            nb_prelevements != 4
            OR nb_depassements != 0
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '002000401'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND annee = 2024
        AND (
            nb_prelevements != 12
            OR nb_depassements != 12
            OR nb_sup_valeur_sanitaire != 11
            OR ratio_limite_qualite != 1.0
        )
    )
    OR
    (
        cdreseau = '002000401'
        AND categorie = 'metabolite_chlorothalonil_r471811'
        AND annee = 2025
        AND (
            -- pour l'instant on a pas tout les prélèvements de 2025
            -- mais on sait déjà qu'avec la règle (pas de limite qualité)
            -- on aura forcément 0 dépassement de la limite qualité
            ratio_limite_qualite != 0.0
        )
    )
    OR
    (
        cdreseau = '002000389'
        AND categorie = 'metabolite_chloridazone_desphenyl'
        AND annee = 2024
        AND (
            nb_prelevements != 19
            OR nb_depassements != 19
            OR nb_sup_valeur_sanitaire != 4
            OR ratio_limite_qualite != 1.0
        )
    )
    OR
    (
        cdreseau = '080001050'
        AND categorie = 'metabolite_atrazine_desethyl'
        AND annee = 2022
        AND (
            nb_prelevements != 4
            OR nb_depassements != 3
            OR nb_sup_valeur_sanitaire != 0
            OR ratio_limite_qualite != 0.75
        )
    )
