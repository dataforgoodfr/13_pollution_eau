WITH
last_pvl AS (
    SELECT
        cdreseau,
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
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pfas'
        AND
        cdparametresiseeaux = 'TFA'
        AND
        -- On garde les prélèvements de moins d'un an à partir du dernier prélèvement
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi') }} AS sub
        ) - INTERVAL 1 YEAR) + INTERVAL 1 DAY
)

SELECT
    cdreseau,
    'tfa' AS categorie,
    'dernier_prel' AS periode,
    datetimeprel AS date_dernier_prel,
    1 AS nb_parametres,
    -- Seuils de gestion en dur car spécifiques au TFA et absents du fichier
    -- de valeurs de référence de Générations Futures
    CASE
        WHEN valtraduite = 0 OR valtraduite IS NULL THEN 'non_quantifie'
        WHEN valtraduite <= 0.1 THEN 'tfa_inf_0_1'
        WHEN valtraduite <= 0.5 THEN 'tfa_inf_0_5'
        WHEN valtraduite <= 2.2 THEN 'tfa_inf_2_2'
        WHEN valtraduite <= 10 THEN 'tfa_inf_10'
        WHEN valtraduite <= 60 THEN 'tfa_inf_60'
        ELSE 'tfa_sup_60'
    END AS resultat,
    CASE
        WHEN valtraduite > 0
            THEN TO_JSON(MAP([cdparametresiseeaux], [valtraduite]))
        ELSE TO_JSON(MAP([], []))
    END AS parametres_detectes
FROM
    last_pvl
WHERE
    row_number = 1
