with ranked as (
    select
        cdreseau,
        referenceprel,
        dateprel,
        heureprel,
        de_partition,
        -- TODO : parfois heureprel est vide, faut gérer ce cas
        -- exemple : referenceprel = '07700233713';
        -- TODO : vérifier si dateprel est toujours renseigné !
        TRY_STRPTIME(
            dateprel || ' ' || REPLACE(heureprel, 'h', ':'), '%Y-%m-%d %H:%M'
        ) as datetimeprel,
        ROW_NUMBER() over (
            partition by cdreseau, referenceprel
            order by
                dateprel,
                heureprel
        ) as row_num
    from
        {{ ref('stg_edc__prevelevements') }}

)

select * exclude (row_num)
from
    ranked
where
    row_num = 1
