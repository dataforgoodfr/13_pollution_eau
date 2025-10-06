WITH
cvm_prels AS (
    -- Certains prélèvements ont plusieurs analyses pour la même substance
    -- C'est très rare pour les CVM (de l'ordre d'une dizaine de cas)
    -- Le SELECT DISTINCT ne dédoublonne pas ces cas là
    -- Donc il n'y a pas d'unicité sur referenceprel dans cetre requête
    SELECT DISTINCT
        de_partition AS annee,
        inseecommune,
        referenceprel,
        datetimeprel,
        limite_qualite,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm'
)

SELECT
    inseecommune,
    annee,
    'cvm' AS categorie,
    'bilan_annuel_' || annee AS periode,
    count(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite > limite_qualite
                THEN referenceprel
        END
    ) AS nb_depassements,
    count(DISTINCT referenceprel) AS nb_prelevements,
    (
        count(
            DISTINCT
            CASE
                WHEN
                    valtraduite IS NOT NULL AND valtraduite > limite_qualite
                    THEN referenceprel
            END
        )::float
        /
        count(DISTINCT referenceprel)::float
    ) AS ratio_limite_qualite,
    to_json({
        'CLVYL': max(valtraduite)
    }) AS parametres_detectes

FROM cvm_prels

GROUP BY inseecommune, annee
