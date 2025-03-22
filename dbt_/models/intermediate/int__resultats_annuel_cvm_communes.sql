WITH
communes_year AS (
    SELECT
        de_partition AS annee,
        categorie,
        cdparametresiseeaux,
        inseecommune,
        sum(1) AS nb_analyses,
        sum(CASE
            WHEN
                valtraduite = 0 OR valtraduite = 1 OR valtraduite IS NULL
                OR valtraduite IS NULL
                OR limitequal_float IS NULL
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_quantify,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL AND valtraduite > limitequal_float
                AND valtraduite != 0 AND valtraduite != 1
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_ok,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL AND valtraduite <= limitequal_float
                AND valtraduite != 0 AND valtraduite != 1
                THEN 1
            ELSE 0
        END) AS nb_analyses_ok
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm'
    GROUP BY
        annee,
        categorie,
        cdparametresiseeaux,
        inseecommune
)

SELECT
    communes_year.annee,
    communes_year.inseecommune,
    communes_year.categorie,
    communes_year.cdparametresiseeaux,
    'bilan annuel' AS periode,
    CASE
        WHEN communes_year.nb_analyses = 0
            THEN 'Pas recherché'
        WHEN
            communes_year.nb_analyses_not_quantify > 0
            AND communes_year.nb_analyses_ok = 0
            THEN 'non quantifié'
        WHEN
            communes_year.nb_analyses > 0
            AND communes_year.nb_analyses_not_ok >= 1
            THEN '> 0,5 µg/L'
        WHEN communes_year.nb_analyses > 0 AND communes_year.nb_analyses_ok >= 1
            THEN '<= 0,5 µg/L'
        ELSE 'Check SQL'
    END AS resultat
FROM
    communes_year
