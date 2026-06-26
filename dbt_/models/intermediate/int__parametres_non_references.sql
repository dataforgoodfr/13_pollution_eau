-- Analyse des paramètres présents dans stg_edc__resultats mais absents des références
-- Générations Futures, pour identifier d'éventuels nouveaux paramètres à référencer

WITH parametres_resultats AS (
    SELECT
        r.cdparametresiseeaux,
        STRING_AGG(DISTINCT r.cdparametre, ', ') AS cdparametre,
        STRING_AGG(DISTINCT r.libmajparametre, ', ') AS libmajparametre,
        STRING_AGG(DISTINCT r.libminparametre, ', ') AS libminparametre,
        STRING_AGG(DISTINCT r.casparam, ', ') AS casparam,
        COUNT(*) AS nb,
        MAX(p.dateprel) AS derniere_date_prel,
        MIN(p.dateprel) AS premiere_date_prel
    FROM {{ ref('stg_edc__resultats') }} AS r
    INNER JOIN {{ ref('stg_edc__prevelevements') }} AS p
        ON r.referenceprel = p.referenceprel
    GROUP BY r.cdparametresiseeaux
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
    nb,
    derniere_date_prel,
    premiere_date_prel
FROM parametres_non_references
ORDER BY premiere_date_prel DESC, cdparametresiseeaux ASC
