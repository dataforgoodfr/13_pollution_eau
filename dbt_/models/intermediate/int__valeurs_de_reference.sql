SELECT
    cdparametresiseeaux,
    MAX(categorie_1) AS categorie_1,
    MAX(categorie_2) AS categorie_2,
    MAX(categorie_3) AS categorie_3,
    MAX(limite_qualite) AS limite_qualite,
    MAX(limite_qualite_unite) AS limite_qualite_unite,
    MAX(valeur_sanitaire_1) AS valeur_sanitaire_1,
    MAX(valeur_sanitaire_1_unite) AS valeur_sanitaire_1_unite,
    MAX(valeur_sanitaire_2) AS valeur_sanitaire_2,
    MAX(valeur_sanitaire_2_unite) AS valeur_sanitaire_2_unite,
    COUNT(*) AS nb_rows -- we enforce this to be 1 in a dbt test
FROM
    {{ ref('references_generations_futures') }}
WHERE
    cdparametresiseeaux IS NOT NULL
    AND cdparametresiseeaux != ''
GROUP BY
    cdparametresiseeaux
