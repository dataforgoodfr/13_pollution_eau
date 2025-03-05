WITH reseau_without_reseau_amont AS (
    SELECT DISTINCT cdreseau
    FROM {{ ref('stg_edc__prevelevements') }}
    WHERE cdreseauamont IS NULL
),

prelevements_uniques AS (
    SELECT
        p.referenceprel,
        p.cdreseau,
        p.dateprel,
        p.heureprel,
        ROW_NUMBER() OVER (
            PARTITION BY p.referenceprel
            ORDER BY
                p.cdreseau,
                p.dateprel,
                p.heureprel
        ) AS row_num
    FROM {{ ref('stg_edc__prevelevements') }} AS p
    LEFT JOIN reseau_without_reseau_amont AS r ON p.cdreseau = r.cdreseau
    WHERE r.cdreseau IS NOT NULL
)

SELECT
    referenceprel,
    cdreseau,
    dateprel,
    heureprel
FROM prelevements_uniques
WHERE row_num = 1
