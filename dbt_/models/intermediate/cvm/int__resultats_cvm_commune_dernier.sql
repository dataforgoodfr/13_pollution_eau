WITH
last_pvl AS (
    SELECT
        inseecommune,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        valtraduite,
        ROW_NUMBER()
            OVER (
                PARTITION BY inseecommune, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
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
            OR last_pvl.valtraduite IS NULL
            THEN 'non_quantifie'
        WHEN
            last_pvl.valtraduite >= 0.5
            THEN 'sup_0_5'
        WHEN
            last_pvl.valtraduite < 0.5
            THEN 'inf_0_5'
        ELSE 'error'
    END AS resultat
FROM
    last_pvl
WHERE
    last_pvl.row_number = 1
