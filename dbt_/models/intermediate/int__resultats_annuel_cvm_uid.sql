WITH
annees AS (
    SELECT unnest(generate_series(2020, 2024)) AS annee
),

list_communes_uid AS (
    SELECT DISTINCT
        annees.annee,
        'cvm' AS categorie,
        com.cdreseau
    FROM
        {{ ref('int__lien_commune_cdreseau') }} AS com
    FULL OUTER JOIN
        annees
        ON
            com.de_partition = annees.annee
),

communes_year AS (
    SELECT
        de_partition AS annee,
        categorie,
        cdreseau,
        sum(1) AS nb_analyses,
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
        cdreseau
),

int__resultats_communes AS (
    SELECT
        annee,
        cdreseau,
        categorie,
        coalesce(nb_analyses, 0) AS nb_analyses,
        coalesce(nb_analyses_not_ok, 0) AS nb_analyses_not_ok,
        coalesce(nb_analyses_ok, 0) AS nb_analyses_ok,
        CASE
            WHEN coalesce(nb_analyses, 0) = 0 THEN 'Pas recherché'
            WHEN
                coalesce(nb_analyses, 0) > 0 AND coalesce(nb_analyses_ok, 0) = 0
                THEN 'jamais quantifié'
            WHEN
                categorie = 'cvm'
                AND coalesce(nb_analyses, 0) > 0
                AND coalesce(nb_analyses_not_ok, 0) > 1
                THEN '> 0,5 µg/L'
            WHEN
                categorie = 'cvm'
                AND coalesce(nb_analyses, 0) > 0
                AND coalesce(nb_analyses_ok, 0) > 0
                THEN '<= 0,5 µg/L'
            ELSE 'Not CVM - other'
        END AS resultat
    FROM
        communes_year
),

int__resultats_all_communes AS (
    SELECT
        list_communes_uid.annee,
        list_communes_uid.cdreseau,
        list_communes_uid.categorie,
        coalesce(int__resultats_communes.nb_analyses, 0) AS nb_analyses,
        coalesce(int__resultats_communes.nb_analyses_not_ok, 0)
            AS nb_analyses_not_ok,
        coalesce(int__resultats_communes.nb_analyses_ok, 0) AS nb_analyses_ok,
        coalesce(int__resultats_communes.resultat, 'Pas recherché') AS resultat
    FROM
        list_communes_uid
    LEFT JOIN
        int__resultats_communes
        ON
            list_communes_uid.annee = int__resultats_communes.annee
            AND list_communes_uid.categorie = int__resultats_communes.categorie
            AND list_communes_uid.cdreseau
            = int__resultats_communes.cdreseau
)

SELECT
    int__resultats_all_communes.cdreseau,
    'bilan annuel' AS periode,
    int__resultats_all_communes.categorie,
    int__resultats_all_communes.resultat,
    cast(concat(int__resultats_all_communes.annee, '-01-01') AS DATE)
        AS date_prvl
FROM
    int__resultats_all_communes
