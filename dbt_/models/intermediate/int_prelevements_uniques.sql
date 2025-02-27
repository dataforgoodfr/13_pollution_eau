WITH reseau_without_reseau_amont AS (
    SELECT DISTINCT
        cdreseau
    FROM {{ ref('stg_edc__prevelevements') }}
    WHERE cdreseauamont IS NULL
),

prelevements_uniques AS (
    SELECT  
        p.referenceprel,
        CASE 
            WHEN p.cdreseauamont IS NOT NULL THEN p.cdreseauamont
            ELSE p.cdreseau
        END AS cdreseau,
        p.dateprel,
        p.heureprel,
        ROW_NUMBER() OVER (PARTITION BY p.referenceprel 
          ORDER BY 
            CASE 
                WHEN p.cdreseauamont IS NOT NULL THEN p.cdreseauamont
                ELSE p.cdreseau
            END, 
            p.dateprel, 
            p.heureprel
        ) as row_num
    FROM {{ ref('stg_edc__prevelevements') }} p
    LEFT JOIN reseau_without_reseau_amont r ON p.cdreseau = r.cdreseau
    WHERE r.cdreseau IS NOT NULL
)

SELECT 
    referenceprel,
    cdreseau,
    dateprel,
    heureprel
    FROM prelevements_uniques
WHERE row_num = 1