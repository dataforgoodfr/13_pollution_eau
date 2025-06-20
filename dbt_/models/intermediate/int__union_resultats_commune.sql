{{
  config(
    materialized='table'
  )
}}

-- Merci de conserver l'ordre (alphabétique) des modèles

-- cvm
SELECT
    inseecommune,
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
    {{ ref('int__resultats_cvm_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_cvm_commune_dernier') }}
UNION ALL
-- pesticide/metabolite
SELECT
    inseecommune,
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
    {{ ref('int__resultats_metabolite_specifique_commune_dernier') }}
UNION ALL
-- sub_indus
SELECT
    inseecommune,
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
    {{ ref('int__resultats_sub_indus_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_sub_indus_commune_dernier') }}
