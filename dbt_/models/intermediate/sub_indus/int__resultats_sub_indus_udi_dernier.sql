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
        cdparametresiseeaux IN ('14DAN', 'PCLAT')
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)

SELECT
    last_pvl.cdreseau,
    'dernier_prel' AS periode,
    last_pvl.datetimeprel AS dernier_prel_datetime,
    last_pvl.valtraduite AS dernier_prel_valeur,
    1 AS nb_parametres,
    'sub_indus_' || last_pvl.cdparametresiseeaux AS categorie,
    CASE
        WHEN
            last_pvl.valtraduite = 0
            OR last_pvl.valtraduite IS NULL
            THEN 'non_quantifie'
        WHEN
            last_pvl.valtraduite >= 0.35
            AND last_pvl.cdparametresiseeaux = '14DAN'
            THEN 'sup_0_35'
        WHEN
            last_pvl.valtraduite < 0.35
            AND last_pvl.cdparametresiseeaux = '14DAN'
            THEN 'inf_0_35'
        WHEN
            last_pvl.valtraduite >= 15
            AND last_pvl.cdparametresiseeaux = 'PCLAT'
            THEN 'sup_15'
        WHEN
            last_pvl.valtraduite >= 4
            AND last_pvl.valtraduite < 15
            AND last_pvl.cdparametresiseeaux = 'PCLAT'
            THEN 'sup_4'
        WHEN
            last_pvl.valtraduite < 4 AND last_pvl.cdparametresiseeaux = 'PCLAT'
            THEN 'inf_4'
        ELSE 'error'
    END AS resultat
FROM
    last_pvl
WHERE
    last_pvl.row_number = 1
