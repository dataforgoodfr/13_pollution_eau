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
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_cvm_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_cvm_commune_dernier') }}
UNION ALL
-- metaux_lourds
-- SELECT
--     inseecommune,
--     periode,
--     categorie,
--     null AS resultat,
--     ratio,
--     null AS date_dernier_prel,
--     null AS nb_parametres,
--     nb_prelevements,
--     null AS nb_sup_valeur_sanitaire,
--     null AS parametres_detectes
-- FROM
--     {{ ref('int__resultats_metaux_lourds_commune_annuel') }}
-- UNION ALL
-- SELECT
--     inseecommune,
--     periode,
--     categorie,
--     resultat,
--     null AS ratio,
--     date_dernier_prel,
--     nb_parametres,
--     null AS nb_prelevements,
--     null AS nb_sup_valeur_sanitaire,
--     parametres_detectes
-- FROM
--     {{ ref('int__resultats_metaux_lourds_commune_dernier') }}
-- UNION ALL
-- nitrate
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_nitrate_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_nitrate_commune_dernier') }}
UNION ALL
-- pesticide/metabolite
SELECT
    inseecommune,
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
    {{ ref('int__resultats_metabolite_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_metabolite_commune_dernier') }}
UNION ALL
-- pesticide/metabolite_specifique
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_metabolite_specifique_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_metabolite_specifique_commune_dernier') }}
UNION ALL
-- pesticide/sub_active
SELECT
    inseecommune,
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
    {{ ref('int__resultats_sub_active_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_sub_active_commune_dernier') }}
UNION ALL
-- pesticide
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_pesticide_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_pesticide_commune_dernier') }}
UNION ALL
-- pfas
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_pfas_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_pfas_commune_dernier') }}
UNION ALL
-- sub_indus
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_sanitaire AS ratio,
    null AS date_dernier_prel,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_sub_indus_commune_annuel') }}
UNION ALL
SELECT
    inseecommune,
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
    {{ ref('int__resultats_sub_indus_commune_dernier') }}
