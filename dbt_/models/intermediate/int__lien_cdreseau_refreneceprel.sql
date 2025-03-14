
with ranked AS (
    SELECT
        cdreseau,
        referenceprel,
        dateprel,
        heureprel,
        TRY_STRPTIME(
            dateprel || ' ' || REPLACE(heureprel, 'h', ':'), '%Y-%m-%d %H:%M'
        ) AS datetimeprel,
        -- TODO : parfois heureprel est vide, faut gérer ce cas
        -- exemple : select * from edc_prelevements where referenceprel = '07700233713';
        -- TODO : vérifier si dateprel est toujours renseigné !
        de_partition,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau, referenceprel
            ORDER BY
                dateprel,
                heureprel
        ) AS row_num
    FROM
        {{ ref('stg_edc__prevelevements') }}

)
SELECT * EXCLUDE (row_num)
FROM
    ranked
WHERE
    row_num = 1
