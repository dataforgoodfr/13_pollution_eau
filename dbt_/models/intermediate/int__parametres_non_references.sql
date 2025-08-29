-- Analyse des paramètres présents dans stg_edc__resultats mais absents des
-- références Générations Futures

WITH parametres_resultats AS (
    SELECT
        cdparametresiseeaux,
        STRING_AGG(DISTINCT cdparametre, ', ') AS cdparametre,
        STRING_AGG(DISTINCT libmajparametre, ', ') AS libmajparametre,
        STRING_AGG(DISTINCT libminparametre, ', ') AS libminparametre,
        STRING_AGG(DISTINCT casparam, ', ') AS casparam,
        COUNT(*) AS nb
    FROM {{ ref('stg_edc__resultats') }}
    WHERE cdparametresiseeaux IS NOT NULL
    GROUP BY
        cdparametresiseeaux
),

parametres_non_references AS (
    SELECT pr.*
    FROM parametres_resultats AS pr
    LEFT JOIN {{ ref('int__valeurs_de_reference') }} AS vr
        ON pr.cdparametresiseeaux = vr.cdparametresiseeaux
    WHERE vr.cdparametresiseeaux IS NULL
)

SELECT
    cdparametresiseeaux,
    cdparametre,
    libmajparametre,
    libminparametre,
    casparam,
    nb
FROM parametres_non_references
ORDER BY nb DESC, cdparametresiseeaux ASC
