WITH
resultats AS (
    SELECT
        referenceprel,
        cdparametresiseeaux,
        valtraduite,
        limitequal,
        CAST(
            REGEXP_EXTRACT(
                REPLACE(limitequal, ',', '.'), '-?\d+(\.\d+)?'
            ) AS FLOAT
        ) AS limitequal_float,
        REGEXP_EXTRACT(limitequal, '[a-zA-Zµg]+/?[a-zA-Z/L]+$') AS unite
    FROM
        {{ ref('stg_edc__resultats') }}
)

SELECT
    resultats.*,
    int__mapping_category_simple.categorie
FROM
    resultats
LEFT JOIN
    int__mapping_category_simple
    ON
        resultats.cdparametresiseeaux
        = int__mapping_category_simple.cdparametresiseeaux
