-- Mapping UDI -> communes desservies (1 ligne = 1 UDI), sur la dernière année disponible.
-- Les listes codes_insee / noms_communes sont dans le même ordre (tri par code INSEE),
-- séparées par " | ".

WITH derniere_annee AS (
    SELECT *
    FROM {{ ref('int__lien_commune_cdreseau') }}
    WHERE de_partition = (
        SELECT MAX(l.de_partition)
        FROM {{ ref('int__lien_commune_cdreseau') }} AS l
    )
)

SELECT
    cdreseau,
    STRING_AGG(DISTINCT nomreseaux, ' | ') AS nomreseau,
    COUNT(DISTINCT inseecommune) AS nb_communes,
    STRING_AGG(
        inseecommune, ' | '
        ORDER BY inseecommune
    ) AS codes_insee,
    STRING_AGG(
        nomcommune, ' | '
        ORDER BY inseecommune
    ) AS noms_communes
FROM derniere_annee
GROUP BY cdreseau
ORDER BY cdreseau
