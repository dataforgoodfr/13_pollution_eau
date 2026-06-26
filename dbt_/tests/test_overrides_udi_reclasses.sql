-- Vérifie que les overrides "pertinent → non_pertinent" appliqués dans
-- int__resultats_udi (et int__resultats_communes) sont bien appliqués.
-- Pour chaque substance reclassée et chaque année testée, on vérifie que
-- categorie_3, limite_qualite et limite_indicative ont les bonnes valeurs.
-- Le test renvoie une ligne par violation (le test passe si vide).
--
-- Conventions :
--   - avant l'année du reclassement :
--      pertinent / limite_qualite = 0.1 / limite_indicative = NULL
--   - à partir de l'année du reclassement :
--      non_pertinent / limite_qualite = NULL / limite_indicative = 0.9



-- Chlorothalonil R471811 : changement en 2025
SELECT
    'int__resultats_udi' AS source,
    '471811R' AS cdparametresiseeaux,
    2024 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = '471811R' AND de_partition = 2024
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'R471811' AS cdparametresiseeaux,
    2024 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'R471811' AND de_partition = 2024
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    '471811R' AS cdparametresiseeaux,
    2025 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = '471811R' AND de_partition >= 2025
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'R471811' AS cdparametresiseeaux,
    2025 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'R471811' AND de_partition >= 2025
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )

-- ESA métolachlore : changement en 2023
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'ESAMTC' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'ESAMTC' AND de_partition = 2022
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCESA' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCESA' AND de_partition = 2022
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'ESAMTC' AS cdparametresiseeaux,
    2023 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'ESAMTC' AND de_partition >= 2023
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCESA' AS cdparametresiseeaux,
    2023 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCESA' AND de_partition >= 2023
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )

-- Metolachlor NOA 413173 : changement en 2023
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCNOA' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCNOA' AND de_partition = 2022
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'NOAMTC' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'NOAMTC' AND de_partition = 2022
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCNOA' AS cdparametresiseeaux,
    2023 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCNOA' AND de_partition >= 2023
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'NOAMTC' AS cdparametresiseeaux,
    2023 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'NOAMTC' AND de_partition >= 2023
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )

-- OXA métolachlore : changement en 2022
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'OXAMTC' AS cdparametresiseeaux,
    2021 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'OXAMTC' AND de_partition = 2021
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCOXA' AS cdparametresiseeaux,
    2021 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCOXA' AND de_partition = 2021
    AND (
        categorie_3 != 'pertinent'
        OR limite_qualite != 0.1
        OR limite_indicative IS NOT NULL
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'OXAMTC' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'OXAMTC' AND de_partition >= 2022
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )
UNION ALL
SELECT
    'int__resultats_udi' AS source,
    'MTCOXA' AS cdparametresiseeaux,
    2022 AS annee,
    categorie_3,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux = 'MTCOXA' AND de_partition >= 2022
    AND (
        categorie_3 != 'non_pertinent'
        OR limite_qualite IS NOT NULL
        OR limite_indicative != 0.9
    )
