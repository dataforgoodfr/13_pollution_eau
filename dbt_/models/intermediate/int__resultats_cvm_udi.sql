WITH
last AS (
    SELECT
        periode,
        cdreseau,
        categorie,
        last_datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_last_cvm_udi') }}
),

yearly AS (
    SELECT
        cdreseau,
        categorie,
        NULL AS last_datetimeprel,
        resultat,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_annuel_cvm_udi') }}
)


SELECT
    periode,
    cdreseau,
    categorie,
    last_datetimeprel,
    resultat
FROM
    last
UNION ALL
SELECT
    periode,
    cdreseau,
    categorie,
    last_datetimeprel,
    resultat
FROM
    yearly
