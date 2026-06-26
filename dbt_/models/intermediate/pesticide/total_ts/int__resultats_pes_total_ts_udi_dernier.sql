WITH
last_pvl AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        categorie_2,
        valtraduite,
        datetimeprel,
        DENSE_RANK()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number

    FROM
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pesticide'
        AND
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi') }} AS sub
        ) - INTERVAL 1 YEAR) + INTERVAL 1 DAY
        AND
        -- On exclut PESTOT car on recalcule nous-mêmes la somme
        cdparametresiseeaux != 'PESTOT'
        AND valtraduite IS NOT NULL
),

aggregated AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        categorie_2,
        MAX(valtraduite) AS valtraduite,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl
    WHERE row_number = 1
    GROUP BY cdreseau, cdparametresiseeaux, categorie_2
),

-- Total incluant substances actives + tous les métabolites (pertinents et non pertinents),
-- identique à total_pesticide_all dans int__resultats_pesticide_udi_dernier.sql
total AS (
    SELECT
        cdreseau,
        MAX(datetimeprel) AS date_dernier_prel,
        SUM(
            CASE
                WHEN
                    (
                        categorie_2 = 'sub_active'
                        OR categorie_2 = 'metabolite'
                    )
                    AND valtraduite IS NOT NULL
                    THEN valtraduite
                ELSE 0
            END
        ) AS total_pesticide_all
    FROM aggregated
    GROUP BY cdreseau
)

SELECT
    cdreseau,
    'pes_total_ts' AS categorie,
    'dernier_prel' AS periode,
    date_dernier_prel,
    CASE
        WHEN total_pesticide_all > 5 THEN 'sup_5'
        WHEN total_pesticide_all > 3 THEN 'sup_3'
        WHEN total_pesticide_all > 1 THEN 'sup_1'
        WHEN total_pesticide_all > 0.5 THEN 'sup_limite_qualite'
        ELSE 'inf_limites'
    END AS resultat,
    TO_JSON({ 'TOTALPESTICIDEALL': total_pesticide_all }) AS parametres_detectes

FROM total
