SELECT
    cdparametresiseeaux,
    STRING_AGG(DISTINCT categorie) AS categorie,
    COUNT(DISTINCT categorie) AS nb_categorie
FROM
    {{ ref('mapping_categories_v2') }}
GROUP BY
    cdparametresiseeaux
