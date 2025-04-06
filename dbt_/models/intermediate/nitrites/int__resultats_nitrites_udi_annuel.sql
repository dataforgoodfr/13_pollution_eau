WITH
prels AS (
    SELECT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3'
                    THEN valtraduite
                ELSE 0
            END
        ) AS valtraduite_no3,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO2'
                    THEN valtraduite
                ELSE 0
            END
        ) AS valtraduite_no2,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3_NO2'
                    THEN valtraduite
                ELSE 0
            END
        ) AS valtraduite_no3_no2
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'nitrite'
    GROUP BY
        annee,
        cdreseau,
        referenceprel,
        datetimeprel,
)


SELECT
    prels.cdreseau,
    prels.annee,
    'nitrite' AS categorie,
    'bilan_annuel_' || prels.annee AS periode,
    COUNT(
        DISTINCT
        CASE
            WHEN
                prels.valtraduite_no3 >= 50
                OR prels.valtraduite_no2 >= 0.5
                OR prels.valtraduite_no3_no2 >= 1
                THEN prels.referenceprel
        END
    ) AS nb_depassements,
    COUNT(DISTINCT prels.referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT
            CASE
                WHEN
                    prels.valtraduite_no3 >= 50
                    OR prels.valtraduite_no2 >= 0.5
                    OR prels.valtraduite_no3_no2 >= 1
                    THEN prels.referenceprel
            END
        )::float
        /
        COUNT(DISTINCT prels.referenceprel)::float
    ) AS ratio_depassements

FROM prels

GROUP BY prels.cdreseau, prels.annee
