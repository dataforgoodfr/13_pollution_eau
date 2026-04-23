WITH
last_pvl AS (
    SELECT DISTINCT
        cdreseau,
        cdparametresiseeaux,
        categorie_2,
        categorie_3,
        valtraduite,
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
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi_communes') }} AS sub
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
        categorie_3,
        MAX(valtraduite) AS valtraduite,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl
    WHERE row_number = 1
    GROUP BY cdreseau, cdparametresiseeaux, categorie_2, categorie_3
),

-- Calcul du total pesticide (substances actives + métabolites pertinents),
-- identique à total_pesticide dans int__resultats_pesticide_udi_dernier.sql
total AS (
    SELECT
        cdreseau,
        MAX(datetimeprel) AS date_dernier_prel,
        SUM(
            CASE
                WHEN
                    (
                        categorie_2 = 'sub_active'
                        OR (categorie_2 = 'metabolite' AND categorie_3 = 'pertinent_par_defaut')
                        OR (categorie_2 = 'metabolite' AND categorie_3 = 'pertinent')
                    )
                    AND valtraduite IS NOT NULL
                    THEN valtraduite
                ELSE 0
            END
        ) AS total_pesticide
    FROM aggregated
    GROUP BY cdreseau
)

SELECT
    cdreseau,
    'pesticide_total' AS categorie,
    'dernier_prel' AS periode,
    date_dernier_prel,
    CASE
        WHEN total_pesticide > 0.5 THEN 'sup_limite_qualite'
        ELSE 'inf_limites'
    END AS resultat,
    TO_JSON({ 'TOTALPESTICIDE': total_pesticide }) AS parametres_detectes

FROM total
