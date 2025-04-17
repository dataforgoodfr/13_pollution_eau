-- Merci de conserver l'ordre (alphabétique) des modèles

-- cvm
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS dernier_prel_datetime,
    null AS dernier_prel_valeur,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_cvm_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    dernier_prel_datetime,
    dernier_prel_valeur,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_cvm_udi_dernier') }}
UNION ALL
-- pfas
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS dernier_prel_datetime,
    null AS dernier_prel_valeur,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_pfas_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    dernier_prel_datetime,
    dernier_prel_valeur,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_pfas_udi_dernier') }}
UNION ALL
-- sub_indus
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_sanitaire AS ratio,
    null AS dernier_prel_datetime,
    null AS dernier_prel_valeur,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_sub_indus_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    dernier_prel_datetime,
    dernier_prel_valeur,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_sub_indus_udi_dernier') }}
UNION ALL
-- nitrites
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    dernier_prel_datetime,
    dernier_prel_valeur,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_nitrites_udi_dernier') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_sanitaire AS ratio,
    null AS dernier_prel_datetime,
    null AS dernier_prel_valeur,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire
FROM
    {{ ref('int__resultats_nitrites_udi_annuel') }}
