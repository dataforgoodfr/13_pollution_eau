WITH
udi AS (
    SELECT
        inseecommune AS commune_code_insee,
        cdreseau
    FROM
        {{ ref('stg_edc__communes') }}
),

cog AS (
    SELECT
        dep AS code_departement,
        reg AS code_region,
        com AS commune_code_insee
    FROM
        {{ ref('stg_communes__cog') }}
)

SELECT
    udi.commune_code_insee,
    udi.cdreseau,
    cog.code_departement,
    cog.code_region
FROM
    udi
LEFT JOIN
    cog
    ON
        udi.commune_code_insee = cog.commune_code_insee
