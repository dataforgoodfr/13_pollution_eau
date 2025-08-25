WITH
nitrate_prels AS (
    -- Certains prélèvements ont plusieurs analyses pour la même substance
    -- Le SELECT DISTINCT ne dédoublonne pas ces cas là
    -- Donc il n'y a pas d'unicité sur referenceprel dans cetre requête
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        valeur_sanitaire_1,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'nitrate'
        AND cdparametresiseeaux = 'NO3'
)

SELECT
    cdreseau,
    annee,
    'nitrate' AS categorie,
    'bilan_annuel_' || annee AS periode,
    count(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite > valeur_sanitaire_1
                THEN referenceprel
        END
    ) AS nb_depassements,
    count(DISTINCT referenceprel) AS nb_prelevements,
    (
        count(
            DISTINCT
            CASE
                WHEN
                    valtraduite IS NOT NULL AND valtraduite > valeur_sanitaire_1
                    THEN referenceprel
            END
        )::float
        /
        count(DISTINCT referenceprel)::float
    ) AS ratio

FROM nitrate_prels

GROUP BY cdreseau, annee
