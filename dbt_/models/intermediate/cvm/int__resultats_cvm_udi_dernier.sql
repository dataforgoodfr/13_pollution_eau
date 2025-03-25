WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite_corrigee,
        limitequal_float,
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
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)

SELECT
    last_pvl.cdreseau,
    last_pvl.categorie,
    last_pvl.cdparametresiseeaux,
    last_pvl.datetimeprel AS last_datetimeprel,
    'dernier prélévement' AS periode,
    CASE
        WHEN
            last_pvl.valtraduite_corrigee = 0
            OR last_pvl.valtraduite_corrigee IS NULL
            OR last_pvl.limitequal_float IS NULL
            THEN 'non quantifié'
        WHEN
            last_pvl.limitequal_float IS NOT NULL
            AND last_pvl.valtraduite_corrigee >= last_pvl.limitequal_float
            THEN '>= 0,5 µg/L'
        WHEN
            last_pvl.limitequal_float IS NOT NULL
            AND last_pvl.valtraduite_corrigee < last_pvl.limitequal_float
            THEN '< 0,5 µg/L'
        ELSE 'Check SQL'
    END AS resultat
FROM
    last_pvl
WHERE
    last_pvl.row_number = 1
