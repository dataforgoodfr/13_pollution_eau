SELECT
    categorie,
    STRING_AGG(DISTINCT souscat, ',') AS souscats,
    STRING_AGG(DISTINCT libminparametre, ',') AS libminparametres,
FROM
    {{ ref('mapping_categories_v2') }}
GROUP BY
    categorie
