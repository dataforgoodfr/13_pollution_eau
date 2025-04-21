WITH
metaux_lourds_prels AS (
    -- Certains prélèvements ont plusieurs analyses pour la même substance
    -- Le SELECT DISTINCT ne dédoublonne pas ces cas là
    -- Donc il n'y a pas d'unicité sur referenceprel dans cetre requête
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        cdparametresiseeaux,
        valeur_sanitaire_1,
        limite_qualite,
        referenceprel,
        datetimeprel,
        valtraduite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        cdparametresiseeaux IN ('PB', 'AS')
)

SELECT
    cdreseau,
    annee,
    CASE
        WHEN cdparametresiseeaux = 'PB' THEN 'metaux_lourds_pb'
        WHEN cdparametresiseeaux = 'AS' THEN 'metaux_lourds_as'
    END AS categorie,
    'bilan_annuel_' || annee AS periode,
    count(
        DISTINCT
        CASE
            WHEN
                cdparametresiseeaux = 'PB'
                AND valtraduite IS NOT NULL AND valtraduite >= limite_qualite
                THEN referenceprel
            WHEN
                cdparametresiseeaux = 'AS'
                AND valtraduite IS NOT NULL AND valtraduite >= valeur_sanitaire_1
                THEN referenceprel
        END
    ) AS nb_depassements,
    count(DISTINCT referenceprel) AS nb_prelevements,
    (
        count(
            DISTINCT
            CASE
                WHEN
                    cdparametresiseeaux = 'PB'
                    AND valtraduite IS NOT NULL
                    AND valtraduite >= limite_qualite
                    THEN referenceprel
                WHEN
                    cdparametresiseeaux = 'AS'
                    AND valtraduite IS NOT NULL
                    AND valtraduite >= valeur_sanitaire_1
                    THEN referenceprel
            END
        )::float
        /
        count(DISTINCT referenceprel)::float
    ) AS ratio_limite_sanitaire

FROM metaux_lourds_prels

GROUP BY cdreseau, annee, categorie
