WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        datetimeprel,
        limite_qualite,
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
        categorie = 'cvm'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)

SELECT
    last_pvl.cdreseau,
    last_pvl.categorie,
    'dernier_prel' AS periode,
    last_pvl.datetimeprel AS date_dernier_prel,
    1 AS nb_parametres,
    CASE
        WHEN
            last_pvl.valtraduite = 0
            OR last_pvl.valtraduite IS NULL
            THEN 'non_quantifie'
        WHEN
            last_pvl.valtraduite >= last_pvl.limite_qualite
            THEN 'sup_0_5'
        WHEN
            last_pvl.valtraduite < last_pvl.limite_qualite
            THEN 'inf_0_5'
        ELSE 'erreur'
    END AS resultat,
    CASE
        WHEN
            last_pvl.valtraduite > 0
            THEN TO_JSON(MAP([last_pvl.cdparametresiseeaux], [last_pvl.valtraduite]))
        ELSE TO_JSON(MAP([], []))
    END AS parametres_detectes
FROM
    last_pvl
WHERE
    last_pvl.row_number = 1
