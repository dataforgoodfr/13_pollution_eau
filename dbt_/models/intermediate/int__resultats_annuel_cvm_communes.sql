WITH
communes_year AS (
    SELECT
        de_partition AS annee,
        categorie,
        inseecommune,
        sum(1) AS nb_analyses,
        sum(CASE
            WHEN WHEN valtraduite = 0 OR valtraduite = 1 OR valtraduite IS NULL THEN 1
            ELSE 0
        END) AS nb_analyses_not_quantify,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL AND valtraduite >= limitequal_float
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_ok,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL AND valtraduite < limitequal_float
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
        inseecommune
)

    SELECT
        annee,
        inseecommune,
        categorie,
        'bilan annuel' AS periode,
        CASE
            WHEN nb_analyses = 0 THEN 'Pas recherché'
            WHEN
                nb_analyses_not_quantify > 0
                AND nb_analyses_ok = 0
                THEN 'non quantifié'
            WHEN
                nb_analyses > 0
                AND nb_analyses_not_ok > 1
                THEN '>= 0,5 µg/L'
            WHEN
                nb_analyses, 0 > 0
                AND nb_analyses_ok, 0 > 0
                THEN '< 0,5 µg/L'
            ELSE 'Check SQL'
        END AS resultat
    FROM
        communes_year
