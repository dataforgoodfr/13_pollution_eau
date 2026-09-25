-- Les bilans annuels des métabolites spécifiques comparent les résultats à
-- COALESCE(limite_qualite, limite_indicative).
-- Ce test vérifie que :
--   - seuls l'ESA métolachlore (ESAMTC, MTCESA) et le chlorothalonil R471811
--     (471811R, R471811) peuvent ne pas avoir de limite de qualité (suite à
--     leur reclassement en métabolite non pertinent) ;
--   - dans ce cas, ils ont bien une limite indicative.
-- Le test renvoie une ligne par violation (le test passe si vide).

SELECT DISTINCT
    'int__resultats_udi' AS source,
    cdparametresiseeaux,
    de_partition,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_udi') }}
WHERE
    cdparametresiseeaux IN (
        'ESAMTC', 'MTCESA', '471811R', 'R471811', 'CLDZ_D', 'CLDZ_MD', 'ADET'
    )
    AND limite_qualite IS NULL
    AND (
        cdparametresiseeaux NOT IN ('ESAMTC', 'MTCESA', '471811R', 'R471811')
        OR limite_indicative IS NULL
    )
UNION ALL
SELECT DISTINCT
    'int__resultats_communes' AS source,
    cdparametresiseeaux,
    de_partition,
    limite_qualite,
    limite_indicative
FROM {{ ref('int__resultats_communes') }}
WHERE
    cdparametresiseeaux IN (
        'ESAMTC', 'MTCESA', '471811R', 'R471811', 'CLDZ_D', 'CLDZ_MD', 'ADET'
    )
    AND limite_qualite IS NULL
    AND (
        cdparametresiseeaux NOT IN ('ESAMTC', 'MTCESA', '471811R', 'R471811')
        OR limite_indicative IS NULL
    )
