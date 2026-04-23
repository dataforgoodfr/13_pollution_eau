WITH
pestot_prels AS (
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND cdparametresiseeaux = 'PESTOT'
)

SELECT
    cdreseau,
    annee,
    'pesticide_total' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT CASE WHEN valtraduite IS NOT NULL AND valtraduite > 0.5 THEN referenceprel END
        )::float
        / COUNT(DISTINCT referenceprel)::float
    ) AS ratio,
    TO_JSON({ 'PESTOT': MAX(valtraduite) }) AS parametres_detectes,
    MAX(datetimeprel) AS date_dernier_prel

FROM pestot_prels

GROUP BY cdreseau, annee
