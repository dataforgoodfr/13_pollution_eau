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
    CASE
        WHEN cdparametresiseeaux = '14DAN' THEN 'sub_indus_14dioxane'
        WHEN cdparametresiseeaux = 'PCLAT' THEN 'sub_indus_perchlorate'
    END AS categorie,
    'bilan_annuel_' || annee AS periode,
    count(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite >= valeur_sanitaire_1
                THEN referenceprel
        END
    ) AS nb_depassements,
    count(DISTINCT referenceprel) AS nb_prelevements,
    (
        count(
            DISTINCT
            CASE
                WHEN
                    valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    THEN referenceprel
            END
        )::float
        /
        count(DISTINCT referenceprel)::float
    ) AS ratio_limite_sanitaire,
    json_object(
        max(cdparametresiseeaux), max(valtraduite)
    ) AS parametres_detectes

FROM prels

GROUP BY inseecommune, annee, categorie
