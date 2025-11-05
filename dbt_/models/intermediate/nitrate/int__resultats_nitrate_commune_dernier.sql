WITH
last_pvl AS (
    SELECT
        inseecommune,
        categorie,
        cdparametresiseeaux,
        valeur_sanitaire_1,
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
        categorie = 'nitrate'
        AND
        cdparametresiseeaux = 'NO3'
        AND
        -- On garde les prélèvements de moins d'un an à partir du dernier prélèvement
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi_communes') }} AS sub
        ) - INTERVAL 1 YEAR) + INTERVAL 1 DAY
        AND
        -- Cf cas cdreseau IN( '034005906') , referenceprel= 03400327764
        valtraduite IS NOT NULL
)

SELECT
    inseecommune,
    'dernier_prel' AS periode,
    datetimeprel AS date_dernier_prel,
    1 AS nb_parametres,
    categorie,
    CASE
        WHEN
            valtraduite > valeur_sanitaire_1
            THEN 'sup_valeur_sanitaire'
        WHEN
            valtraduite <= 10
            THEN 'non_quantifie'
        WHEN
            valtraduite <= 25
            THEN 'no3_inf_25'
        WHEN
            valtraduite > 25 AND valtraduite <= 40
            THEN 'no3_inf_40'
        WHEN
            valtraduite > 40 AND valtraduite <= valeur_sanitaire_1
            THEN 'inf_valeur_sanitaire'
        ELSE 'error'
    END AS resultat,
    JSON_OBJECT(CASE WHEN valtraduite > 0 THEN cdparametresiseeaux END, valtraduite)
        AS parametres_detectes
FROM
    last_pvl
WHERE
    row_number = 1
