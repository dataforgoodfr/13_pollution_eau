WITH
last_pvl AS (
    SELECT DISTINCT
        inseecommune,
        categorie,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1,
        datetimeprel,
        DENSE_RANK()
            OVER (
                PARTITION BY inseecommune
                ORDER BY datetimeprel DESC
            )
            AS row_number

    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'sub_active'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

aggregated AS (
    SELECT
        inseecommune,
        cdparametresiseeaux,
        MAX(valtraduite) AS valtraduite,
        MAX(limite_qualite) AS limite_qualite,
        MAX(valeur_sanitaire_1) AS valeur_sanitaire_1,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl
    WHERE row_number = 1
    GROUP BY inseecommune, cdparametresiseeaux
)

SELECT
    inseecommune,
    'sub_active' AS categorie,
    'dernier_prel' AS periode,
    MAX(datetimeprel) AS date_dernier_prel,
    COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
    CASE
        WHEN BOOL_AND(valtraduite IS NULL OR valtraduite = 0) THEN 'non_quantifie'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite >= valeur_sanitaire_1)
            THEN 'sup_valeur_sanitaire'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite >= limite_qualite)
            THEN 'sup_limite_qualite'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite < limite_qualite)
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat,
    TO_JSON(
        MAP(
            LIST(
                cdparametresiseeaux
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            ),
            LIST(
                valtraduite
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            )
        )
    ) AS parametres_detectes

FROM aggregated
GROUP BY inseecommune
