WITH combined_data AS (
    SELECT
        code_udi,
        geom
    FROM {{ ref("stg_atlasante_udi_2023") }}
    UNION ALL
    SELECT
        cn_udi AS code_udi,
        geom
    FROM {{ ref("stg_atlasante_udi_corse") }}
),

ranked_data AS (
    SELECT
        code_udi,
        geom,
        ROW_NUMBER() OVER (
            PARTITION BY code_udi
            ORDER BY code_udi
        ) AS row_num
    FROM combined_data
    WHERE code_udi IS NOT null AND code_udi != ''
)

SELECT
    code_udi,
    ST_ASGEOJSON(geom) AS geom
FROM ranked_data
WHERE row_num = 1
