{{
  config(
    materialized='table'
  )
}}

-- Merci de conserver l'ordre (alphabétique) des modèles

-- cvm
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_cvm_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_cvm_udi_dernier') }}
UNION ALL
-- metaux_lourds
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_metaux_lourds_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_metaux_lourds_udi_dernier') }}
UNION ALL
-- nitrate
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_nitrate_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_nitrate_udi_dernier') }}
UNION ALL
-- pesticide/metabolite
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_metabolite_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_metabolite_udi_dernier') }}
UNION ALL
-- pesticide/metabolite_specifique
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_metabolite_specifique_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_metabolite_specifique_udi_dernier') }}
UNION ALL
-- pesticide/sub_active
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_sub_active_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_sub_active_udi_dernier') }}
UNION ALL
-- pesticide
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_pesticide_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_pesticide_udi_dernier') }}
UNION ALL
-- pfas
SELECT
    cdreseau,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_pfas_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
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
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
FROM
    {{ ref('int__resultats_sub_indus_udi_annuel') }}
UNION ALL
SELECT
    cdreseau,
    periode,
    categorie,
    resultat,
    null AS ratio,
    date_dernier_prel,
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_sub_indus_udi_dernier') }}
