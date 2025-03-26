WITH
last AS (
    SELECT
        periode,
        cdreseau,
        categorie,
        last_datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_udi_dernier') }}
),

yearly AS (
    SELECT
        cdreseau,
        categorie,
        NULL AS last_datetimeprel,
        resultat,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_udi_annuel') }}
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
