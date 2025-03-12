WITH
mesures_cat_communes AS (
    SELECT
        mesures_cat.*,
        prelevement.dateprel,
        udi.commune_code_insee AS commune_code_insee,
    FROM 
       {{ ref('int__mesures_cat') }} AS mesures_cat
    LEFT JOIN
       {{ ref('stg_edc__prelevement') }} AS prelevement
    ON
       mesures_cat.referenceprel = prelevement.referenceprel
    LEFT JOIN
       {{ ref('stg_edc__communes') }} AS udi
    ON
    	udi.cdreseau = prelevement.cdreseau
        AND udi.year = extract( YEAR FROM prelevement.dateprel)    
)

SELECT 
 extract( YEAR FROM mesures_cat_communes.dateprel) as annee,
 categorie,
 commune_code_insee,
 SUM(1) AS nb_analyses,
 SUM(case
        when limitequal_float is not NULL and valtraduite >= limitequal_float then 1
        else 0
    end ) AS nb_analyses_not_ok,
 SUM(case
        when limitequal_float is not NULL and valtraduite < limitequal_float then 1
        else 0
    end ) AS nb_analyses_ok,    
FROM
 mesures_cat_communes
GROUP BY 
    1,2,3