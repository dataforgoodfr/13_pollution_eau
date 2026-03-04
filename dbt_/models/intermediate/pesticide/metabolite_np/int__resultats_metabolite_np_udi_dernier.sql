WITH
last_pvl AS (
    SELECT DISTINCT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        limite_indicative,
        valeur_sanitaire_1,
        datetimeprel,
        DENSE_RANK()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number

    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'metabolite'
        AND
        categorie_3 = 'non_pertinent'
        AND
        -- On garde les prélèvements de moins d'un an à partir du dernier prélèvement
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi_communes') }} AS sub
        ) - INTERVAL 1 YEAR) + INTERVAL 1 DAY
),

aggregated AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        MAX(valtraduite) AS valtraduite,
        MAX(limite_indicative) AS limite_indicative,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl
    WHERE row_number = 1
    GROUP BY cdreseau, cdparametresiseeaux
)

SELECT
    cdreseau,
    'metabolite_np' AS categorie,
    'dernier_prel' AS periode,
    MAX(datetimeprel) AS date_dernier_prel,
    COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
    CASE
        WHEN BOOL_AND(valtraduite IS NULL OR valtraduite = 0) THEN 'non_quantifie'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite > limite_indicative)
            THEN 'sup_limite_indicative'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite > 0.1)
            THEN 'inf_limites_sup_0_1'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite <= 0.1)
            THEN 'inf_limites'
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
GROUP BY cdreseau
