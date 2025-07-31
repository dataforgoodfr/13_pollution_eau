WITH ranked_communes AS (
    SELECT
        com_code,
        com_name,
        geom,
        ROW_NUMBER() OVER (
            PARTITION BY com_code
            ORDER BY com_code
        ) AS row_num
    FROM {{ ref('stg_communes__opendatasoft') }}
    WHERE com_code IS NOT NULL AND com_code != ''
)

SELECT
    com_code,
    com_name,
    ST_ASGEOJSON(geom) AS geom
FROM ranked_communes
WHERE row_num = 1
