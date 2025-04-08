WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'nitrite'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

split_nitrites AS (
    SELECT
        last_pvl.cdreseau,
        last_pvl.categorie,
        COUNT(DISTINCT last_pvl.cdparametresiseeaux) AS nb_parametres,
        MAX(last_pvl.datetimeprel) AS dernier_prel_datetime,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3'
                    THEN last_pvl.datetimeprel
            END
        ) AS dernier_prel_datetime_n03,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO2'
                    THEN last_pvl.datetimeprel
            END
        ) AS dernier_prel_datetime_n02,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3_NO2'
                    THEN last_pvl.datetimeprel
            END
        ) AS dernier_prel_datetime_no3_no2,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no3,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO2'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no2,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3_NO2'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no3_no2
    FROM
        last_pvl
    WHERE
        last_pvl.row_number = 1
    GROUP BY
        last_pvl.cdreseau,
        last_pvl.categorie
)

SELECT
    split_nitrites.cdreseau,
    split_nitrites.categorie,
    'dernier_prel' AS periode,
    split_nitrites.dernier_prel_datetime,
    split_nitrites.nb_parametres,
    CASE
        WHEN
            DATE_DIFF(
                'day',
                LEAST(
                    split_nitrites.dernier_prel_datetime_n03,
                    split_nitrites.dernier_prel_datetime_n02,
                    split_nitrites.dernier_prel_datetime_no3_no2
                ),
                GREATEST(
                    split_nitrites.dernier_prel_datetime_n03,
                    split_nitrites.dernier_prel_datetime_n02,
                    split_nitrites.dernier_prel_datetime_no3_no2
                )
            ) >= 30
            OR split_nitrites.valtraduite_no2 IS NULL
            OR split_nitrites.valtraduite_no3 IS NULL
            THEN 'donnee_manquante'
        WHEN
            split_nitrites.valtraduite_no3_no2 IS NULL
            AND split_nitrites.valtraduite_no2 IS NOT NULL
            AND split_nitrites.valtraduite_no3 IS NOT NULL
            AND split_nitrites.valtraduite_no3 < 50
            AND split_nitrites.valtraduite_no2 < 0.5
            AND split_nitrites.valtraduite_no3 / 50
            + split_nitrites.valtraduite_no2 / 3
            < 1
            THEN 'conforme'
        WHEN
            split_nitrites.nb_parametres = 3
            AND split_nitrites.valtraduite_no3 < 50
            AND split_nitrites.valtraduite_no2 < 0.5
            AND split_nitrites.valtraduite_no3_no2 < 1
            THEN 'conforme'
        WHEN
            split_nitrites.valtraduite_no3 >= 50
            OR split_nitrites.valtraduite_no2 >= 0.5
            OR split_nitrites.valtraduite_no3_no2 >= 1
            THEN 'non_conforme'
        /*        WHEN
            split_nitrites.nb_parametres != 3
            AND (
                split_nitrites.valtraduite_no3 < 50
                OR split_nitrites.valtraduite_no2 < 0.5
                OR split_nitrites.valtraduite_no3_no2 < 1
            )
            THEN 'non_quantifie'*/
        ELSE 'error'
    END AS resultat
FROM
    split_nitrites
