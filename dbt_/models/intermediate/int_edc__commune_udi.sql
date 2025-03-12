WITH
udi AS (
    SELECT
        inseecommune AS commune_code_insee,
        cdreseau,
        de_partition,
        -- Prenons toujours le même nom de commune pour une inseecommune donnée
        MIN(nomcommune) AS nomcommune,
        -- Agréger les différentes valeurs de quartier en une liste sans doublons
        STRING_AGG(DISTINCT quartier, ', ') FILTER (
            WHERE quartier IS NOT NULL AND quartier != ''
        ) AS quartiers,
        -- Agréger les différentes valeurs de nomreseau en une liste sans doublons
        STRING_AGG(DISTINCT nomreseau, ', ') FILTER (
            WHERE nomreseau IS NOT NULL AND nomreseau != ''
        ) AS nomreseaux,
        -- Prendre la première date de début d'alimentation
        MIN(debutalim) AS debutalim
    FROM
        {{ ref('stg_edc__communes') }}
    GROUP BY
        inseecommune,
        cdreseau,
        de_partition
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
    udi.*,
    cog.code_departement,
    cog.code_region
FROM
    udi
LEFT JOIN
    cog
    ON
        udi.commune_code_insee = cog.commune_code_insee
