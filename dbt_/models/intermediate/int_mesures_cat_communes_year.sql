WITH
mesures_cat_communes AS (
    SELECT
        mesures_cat.*,
        prelevement.dateprel,
        udi.commune_code_insee
    FROM
        {{ ref('int__mesures_cat') }} AS mesures_cat
    LEFT JOIN
        {{ ref('stg_edc__prelevement') }} AS prelevement
        ON
            mesures_cat.referenceprel = prelevement.referenceprel
    LEFT JOIN
        {{ ref('stg_edc__communes') }} AS udi
        ON
            prelevement.cdreseau = udi.cdreseau
            AND udi.year = extract(YEAR FROM prelevement.dateprel)
)

SELECT
    extract(YEAR FROM mesures_cat_communes.dateprel) AS annee,
    mesures_cat_communes.categorie,
    mesures_cat_communes.commune_code_insee,
    sum(1) AS nb_analyses,
    sum(CASE
        WHEN
            mesures_cat_communes.limitequal_float IS NOT NULL
            AND mesures_cat_communes.valtraduite
            >= mesures_cat_communes.limitequal_float
            THEN 1
        ELSE 0
    END) AS nb_analyses_not_ok,
    sum(CASE
        WHEN
            mesures_cat_communes.limitequal_float IS NOT NULL
            AND mesures_cat_communes.valtraduite
            < mesures_cat_communes.limitequal_float
            THEN 1
        ELSE 0
    END) AS nb_analyses_ok
FROM
    mesures_cat_communes
GROUP BY
    1, 2, 3
