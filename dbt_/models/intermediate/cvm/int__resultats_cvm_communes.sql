WITH
last AS (
    SELECT
        inseecommune AS commune_code_insee,
        categorie,
        last_datetimeprel,
        resultat,
        periode
    FROM
        {{ ref('int__resultats_cvm_communes_dernier') }}
),

yearly AS (
    SELECT
        inseecommune AS commune_code_insee,
        categorie,
        NULL AS last_datetimeprel,
        resultat,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_cvm_communes_annuel') }}
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
