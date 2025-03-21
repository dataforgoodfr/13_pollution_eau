WITH
last AS (
    SELECT
        periode,
        inseecommune AS commune_code_insee,
        categorie,
        last_datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_last_cvm_communes') }}
),

yearly AS (
    SELECT
        inseecommune AS commune_code_insee,
        categorie,
        NULL AS last_datetimeprel,
        resultat,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_annuel_cvm_communes') }}
)


SELECT
    periode,
    commune_code_insee,
    categorie,
    last_datetimeprel,
    resultat
FROM
    last
UNION ALL
SELECT
    periode,
    commune_code_insee,
    categorie,
    last_datetimeprel,
    resultat
FROM
    yearly
