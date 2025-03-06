WITH 
prelevements_cdfirstreseauamont AS (
    SELECT DISTINCT
      referenceprel , 
      (CASE 
        WHEN cdreseauamont IS NULL THEN cdreseau
        WHEN cdreseauamont IS NOT NULL THEN cdreseauamont
      END) AS cdfirstreseauamont,
      dateprel ,	
      heureprel ,
      TRY_STRPTIME(dateprel || ' ' || REPLACE(heureprel, 'h', ':'), '%Y-%m-%d %H:%M') AS datetimeprel,
      conclusionprel ,
      plvconformitebacterio ,	
      plvconformitechimique ,
      plvconformitereferencebact ,
      plvconformitereferencechim ,
    FROM
        edc_prelevements ),

ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER ( 
                PARTITION BY referenceprel
                ORDER BY
                    dateprel,
                    heureprel
            )  AS row_num
        FROM 
            prelevements_cdfirstreseauamont
        )

SELECT 
    * EXCLUDE (row_num)
FROM 
        ranked
WHERE 
       row_num = 1