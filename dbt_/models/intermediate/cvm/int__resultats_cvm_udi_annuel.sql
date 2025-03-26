WITH
udi AS (
    SELECT DISTINCT
        de_partition,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        valtraduite,
        limitequal_float
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm'
),

udi_year AS (
    SELECT
        de_partition AS annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        sum(1) AS nb_analyses,
        sum(CASE
            WHEN
                valtraduite = 0
                OR valtraduite IS NULL
                OR limitequal_float IS NULL
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_quantify,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL
                AND valtraduite >= limitequal_float
                AND valtraduite != 0
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_ok,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL
                AND valtraduite < limitequal_float
                AND valtraduite != 0
                THEN 1
            ELSE 0
        END) AS nb_analyses_ok
    FROM
        udi
    WHERE
        categorie = 'cvm'
    GROUP BY
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux
)

SELECT
    udi_year.annee,
    udi_year.cdreseau,
    udi_year.categorie,
    udi_year.cdparametresiseeaux,
    'bilan annuel' AS periode,
    CASE
        WHEN udi_year.nb_analyses = 0
            THEN 'Pas recherché'
        WHEN
            udi_year.nb_analyses_not_quantify > 0
            AND udi_year.nb_analyses_ok = 0
            THEN 'non quantifié'
        WHEN
            udi_year.nb_analyses > 0
            AND udi_year.nb_analyses_not_ok >= 1
            THEN '>= 0,5 µg/L'
        WHEN udi_year.nb_analyses > 0 AND udi_year.nb_analyses_ok >= 1
            THEN '< 0,5 µg/L'
        ELSE 'Check SQL'
    END AS resultat,
    CASE
        WHEN udi_year.nb_analyses IS NOT NULL
            THEN udi_year.nb_analyses_not_ok / udi_year.nb_analyses
    END AS pourcentage_depassement
FROM
    udi_year
