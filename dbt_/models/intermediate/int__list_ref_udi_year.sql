WITH
annees AS (
    SELECT unnest(generate_series(2020, 2024)) AS annee
),

cat AS (
    SELECT categorie FROM {{ ref('int__mapping_category_simple') }}
    GROUP BY 1
),

year_cat AS (
    SELECT
        annee,
        categorie
    FROM
        annees
    CROSS JOIN
        cat
),

udi AS (
    SELECT
        de_partition AS year,
        inseecommune AS commune_code_insee,
        cdreseau
    FROM
        {{ ref('stg_edc__communes') }}
    GROUP BY
        1, 2, 3
)

SELECT DISTINCT
    annee,
    categorie,
    commune_code_insee
FROM
    udi
FULL OUTER JOIN
    year_cat
    ON
        udi.year = year_cat.annee
