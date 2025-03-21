WITH
last_pvl AS (
    SELECT
        *,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm' -- à supprimer pour avoir pour tout
)
    SELECT
        cdreseau,
        cdparametresiseeaux,
        datetimeprel,
        'dernier prélévement' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite = 1 OR valtraduite IS NULL THEN 'non quantifié'
            WHEN
                limitequal_float IS NOT NULL AND valtraduite > limitequal_float
                THEN '> 0,5 µg/L'
            WHEN
                limitequal_float IS NOT NULL AND valtraduite <= limitequal_float
                THEN '<= 0,5 µg/L'
            ELSE 'error check SQL'
        END AS resultat
    FROM
        last_pvl
    WHERE
        last_pvl.row_number = 1
