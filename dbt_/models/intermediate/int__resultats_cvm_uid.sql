WITH
last AS (
    SELECT
        periode,
        cdreseau,
        categorie,
        datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_last_cvm_uid') }}
),

yearly AS (
    SELECT
        cdreseau,
        categorie,
        NULL AS datetimeprel,
        resultat,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_annuel_cvm_uid') }}
)


SELECT
    periode,
    cdreseau,
    categorie,
    datetimeprel,
    resultat
FROM
    last
UNION ALL
SELECT
    periode,
    cdreseau,
    categorie,
    datetimeprel,
    resultat
FROM
    yearly
