WITH
udi_year AS (
    SELECT
        de_partition AS annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        sum(1) AS nb_analyses,
        sum(CASE
            WHEN
                valtraduite_corrigee = 0
                OR valtraduite_corrigee IS NULL
                OR limitequal_float IS NULL
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_quantify,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL
                AND valtraduite_corrigee >= limitequal_float
                AND valtraduite_corrigee != 0
                THEN 1
            ELSE 0
        END) AS nb_analyses_not_ok,
        sum(CASE
            WHEN
                limitequal_float IS NOT NULL
                AND valtraduite_corrigee < limitequal_float
                AND valtraduite_corrigee != 0
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
        cdreseau,
        cdparametresiseeaux
),

udi_year_days AS (
    SELECT
        de_partition AS annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite_corrigee,
        CASE
            WHEN
                valtraduite_corrigee = 0
                OR valtraduite_corrigee IS NULL
                OR limitequal_float IS NULL
                THEN 'non quantifié'
            WHEN
                valtraduite_corrigee > limitequal_float
                THEN '>= 0,5 µg/L'
            WHEN
                valtraduite_corrigee <= limitequal_float
                THEN '< 0,5 µg/L'
            ELSE 'Check SQL'
        END AS actual_resultats
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm'
),

udi_year_days_previous AS (
    SELECT
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite_corrigee,
        actual_resultats,
        lag(datetimeprel) OVER (
            PARTITION BY annee, categorie, cdreseau, cdparametresiseeaux
            ORDER BY datetimeprel
        ) AS previous_datetimeprel,
        lag(actual_resultats) OVER (
            PARTITION BY annee, categorie, cdreseau, cdparametresiseeaux
            ORDER BY datetimeprel
        ) AS previous_resultats
    FROM
        udi_year_days
),

udi_year_days_count AS (
    SELECT
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        previous_resultats AS resultats,
        date_diff('day', previous_datetimeprel, datetimeprel)
            AS nb_days_intervall
    FROM
        udi_year_days_previous
    WHERE
        previous_resultats IS NOT NULL
),

udi_year_days_count_per_result AS (
    SELECT
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        sum(CASE WHEN resultats = '<= 0,5 µg/L' THEN nb_days_intervall END)
            AS nb_days_ok,
        sum(CASE WHEN resultats = '> 0,5 µg/L' THEN nb_days_intervall END)
            AS nb_days_ko,
        sum(CASE WHEN resultats = 'non quantifié' THEN nb_days_intervall END)
            AS nb_days_non_quantifie,
        sum(nb_days_intervall) AS total_days
    FROM
        udi_year_days_count
    GROUP BY
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux
),

udi_year_days_sum AS (
    SELECT
        annee,
        categorie,
        cdreseau,
        cdparametresiseeaux,
        coalesce(max(nb_days_ok), 0) AS nb_days_ok,
        coalesce(max(nb_days_ko), 0) AS nb_days_ko,
        coalesce(max(nb_days_non_quantifie), 0) AS nb_days_non_quantifie,
        coalesce(max(total_days), 0) AS total_days,
        coalesce(max(nb_days_ko), 0)
        / coalesce(max(total_days), 0) AS percent_ko
    FROM
        udi_year_days_count_per_result
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
    udi_year_days_sum.percent_ko,
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
    END AS resultat
FROM
    udi_year
LEFT JOIN
    udi_year_days_sum
    ON
        udi_year.annee = udi_year_days_sum.annee
        AND udi_year.cdreseau = udi_year_days_sum.cdreseau
        AND udi_year.categorie = udi_year_days_sum.categorie
        AND udi_year.cdparametresiseeaux = udi_year_days_sum.cdparametresiseeaux
