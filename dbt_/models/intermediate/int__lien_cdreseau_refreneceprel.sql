with ranked as (
    select
        cdreseau,
        referenceprel,
        dateprel,
        heureprel,
        de_partition,
        -- Quand heureprel est null ou invalide, on choisit arbitrairement 09:00
        -- Examples:
        -- referenceprel = '07700233713'
        -- referenceprel = '02800116863'
        COALESCE(
            TRY_STRPTIME(
                dateprel || ' ' || REPLACE(heureprel, 'h', ':'),
                '%Y-%m-%d %H:%M'
            ),
            TRY_STRPTIME(
                dateprel || ' 09:00',
                '%Y-%m-%d %H:%M'
            )
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
