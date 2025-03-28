SELECT
    inseecommune,
    periode,
    categorie,
    null AS resultat,
    ratio_depassements AS ratio,
    null AS dernier_prel_datetime,
    null AS dernier_prel_valeur,
    null AS nb_parametres
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
    nb_parametres
FROM
    {{ ref('int__resultats_cvm_commune_dernier') }}
