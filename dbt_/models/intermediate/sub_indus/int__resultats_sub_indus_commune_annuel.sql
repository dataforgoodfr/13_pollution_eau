WITH
prels AS (
    -- Certains prélèvements ont plusieurs analyses pour la même substance
    -- Le SELECT DISTINCT ne dédoublonne pas ces cas là
    -- Donc il n'y a pas d'unicité sur referenceprel dans cetre requête
    SELECT DISTINCT
        de_partition AS annee,
        inseecommune,
        cdparametresiseeaux,
        valeur_sanitaire_1,
        referenceprel,
        datetimeprel,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        cdparametresiseeaux IN ('14DAN', 'PCLAT')
)

SELECT
    inseecommune,
    annee,
    'sub_indus_' || cdparametresiseeaux AS categorie,
    'bilan_annuel_' || annee AS periode,
    count(
        DISTINCT
        CASE
            WHEN
                (
                    valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    AND cdparametresiseeaux = '14DAN'
                )
                OR (
                    valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    AND cdparametresiseeaux = 'PCLAT'
                )
                THEN referenceprel
        END
    ) AS nb_depassements,
    count(DISTINCT referenceprel) AS nb_prelevements,
    (
        count(
            DISTINCT
            CASE
                WHEN
                    (
                        valtraduite IS NOT NULL
                        AND valtraduite >= valeur_sanitaire_1
                        AND cdparametresiseeaux = '14DAN'
                    )
                    OR (
                        valtraduite IS NOT NULL
                        AND valtraduite >= valeur_sanitaire_1
                        AND cdparametresiseeaux = 'PCLAT'
                    )
                    THEN referenceprel
            END
        )::float
        /
        count(DISTINCT referenceprel)::float
    ) AS ratio_depassements

FROM prels

GROUP BY inseecommune, annee, categorie
