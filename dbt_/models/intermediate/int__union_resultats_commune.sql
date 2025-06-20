-- Merci de conserver l'ordre (alphabétique) des modèles

-- cvm
SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_limite_qualite AS ratio,
    null AS dernier_prel_datetime,
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
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
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
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
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
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
    null AS nb_parametres,
    nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    null AS parametres_detectes
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
    nb_parametres,
    null AS nb_prelevements,
    null AS nb_sup_valeur_sanitaire,
    parametres_detectes
FROM
    {{ ref('int__resultats_sub_indus_commune_dernier') }}
