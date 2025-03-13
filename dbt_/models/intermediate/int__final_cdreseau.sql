WITH
SELECT
    list_ref_udi_year.annee,
    list_ref_udi_year.commune_code_insee,
    list_ref_udi_year.categorie,
    udi.nomcommune,
    udi.cdreseau,
    coalesce(nb_analyses,0) AS nb_analyses,
    coalesce(nb_analyses_not_ok,0) AS nb_analyses_not_ok ,
    coalesce(nb_analyses_ok,0) AS nb_analyses_ok,
    CASE /* 'cvm'  */
        WHEN list_ref_udi_year.categorie = 'cvm' AND coalesce(nb_analyses,0) = 0 THEN 'Pas recherché'
         WHEN list_ref_udi_year.categorie = 'cvm' AND coalesce(nb_analyses,0) > 0  AND coalesce(nb_analyses_ok,0) = 0 THEN 'jamais quantifié'
         WHEN list_ref_udi_year.categorie = 'cvm' AND coalesce(nb_analyses,0) > 0  AND coalesce(nb_analyses_not_ok,0) > 1 THEN '> 0,5 µg/L'
         WHEN list_ref_udi_year.categorie = 'cvm' AND coalesce(nb_analyses,0) > 0  AND coalesce(nb_analyses_ok,0) > 0 THEN '<= 0,5 µg/L'
         ELSE 'a completer pour les autres substance'
    END AS resultat_per_cdreseau
FROM  
  {{ ref('int__list_ref_udi_year') }} AS list_ref_udi_year
LEFT JOIN 
  {{ ref('int__mesures_cat_communes_year') }} AS mesures_cat_communes_year
ON
    list_ref_udi_year.annee =  mesures_cat_communes_year.annee
    AND list_ref_udi_year.categorie =  mesures_cat_communes_year.categorie
    AND  list_ref_udi_year.commune_code_insee  =  mesures_cat_communes_year.commune_code_insee
LEFT JOIN 
 {{ ref('int__list_ref_udi_year') }} AS udi
ON
    mesures_cat_communes_year.annee =  udi.year
    AND  mesures_cat_communes_year.commune_code_insee  =  udi.commune_code_insee    
    AND  mesures_cat_communes_year.cdreseau  =  udi.cdreseau 