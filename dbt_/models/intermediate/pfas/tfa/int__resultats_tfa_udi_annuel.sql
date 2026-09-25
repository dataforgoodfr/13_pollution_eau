WITH
tfa_prels AS (
    -- Certains prélèvements ont plusieurs analyses pour la même substance
    -- Le SELECT DISTINCT ne dédoublonne pas ces cas là
    -- Donc il n'y a pas d'unicité sur referenceprel dans cette requête
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        valtraduite
    FROM
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pfas'
        AND cdparametresiseeaux = 'TFA'
)

SELECT
    cdreseau,
    annee,
    'tfa' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(
        DISTINCT
        -- 0,5 µg/L est la limite de qualité réglementaire du total PFAS,
        -- dont le TFA fait partie
        CASE
            WHEN valtraduite IS NOT NULL AND valtraduite > 0.5
                THEN referenceprel
        END
    ) AS nb_depassements,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT
            CASE
                WHEN valtraduite IS NOT NULL AND valtraduite > 0.5
                    THEN referenceprel
            END
        )::float
        /
        COUNT(DISTINCT referenceprel)::float
    ) AS ratio_limite_qualite,
    TO_JSON({ 'TFA': MAX(valtraduite) }) AS parametres_detectes,
    MAX(datetimeprel) AS date_dernier_prel

FROM tfa_prels

GROUP BY cdreseau, annee
