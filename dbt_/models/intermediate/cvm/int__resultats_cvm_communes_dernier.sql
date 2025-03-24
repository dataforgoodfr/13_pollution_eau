WITH
last_pvl AS (
    SELECT
        inseecommune,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite,
        limitequal_float,
        ROW_NUMBER()
            OVER (
                PARTITION BY inseecommune, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm' -- à supprimer pour avoir pour tout
)

SELECT
    last_pvl.inseecommune,
    last_pvl.categorie,
    last_pvl.cdparametresiseeaux,
    last_pvl.datetimeprel AS last_datetimeprel,
    'dernier prélévement' AS periode,
    CASE
        WHEN
            last_pvl.valtraduite = 0
            OR last_pvl.valtraduite = 1
            OR last_pvl.valtraduite IS NULL
            OR last_pvl.limitequal_float IS NULL
            THEN 'non quantifié'
        WHEN
            last_pvl.limitequal_float IS NOT NULL
            AND last_pvl.valtraduite > last_pvl.limitequal_float
            THEN '> 0,5 µg/L'
        WHEN
            last_pvl.limitequal_float IS NOT NULL
            AND last_pvl.valtraduite <= last_pvl.limitequal_float
            THEN '<= 0,5 µg/L'
        ELSE 'Check SQL'
    END AS resultat
FROM
    last_pvl
WHERE
    last_pvl.row_number = 1
