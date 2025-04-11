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
        categorie = 'nitrate'
    GROUP BY
        annee,
        cdreseau,
        referenceprel,
        datetimeprel,
),

valeur_ref AS (
    SELECT
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no3,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3_NO2'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no3_no2,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO2'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no2
    FROM
        {{ ref('int__valeurs_de_reference') }}
    WHERE
        categorie_1 = 'nitrate'
),

SELECT
    prels.cdreseau,
    prels.annee,
    'nitrate' AS categorie,
    'bilan_annuel_' || prels.annee AS periode,
    COUNT(
        DISTINCT
        CASE
            WHEN
                prels.valtraduite_no3 >= valeur_ref.limite_qualite_no3
                OR prels.valtraduite_no2 >= valeur_ref.limite_qualite_no2
                OR prels.valtraduite_no3_no2
                >= valeur_ref.limite_qualite_no3_no2
                OR prels.valtraduite_no3 / 50 + prels.valtraduite_no2 / 3
                >= valeur_ref.limite_qualite_no3_no2
                THEN prels.referenceprel
        END
    ) AS nb_depassements,
    COUNT(DISTINCT prels.referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT
            CASE
                WHEN
                    prels.valtraduite_no3 >= valeur_ref.limite_qualite_no3
                    OR prels.valtraduite_no2 >= valeur_ref.limite_qualite_no2
                    OR prels.valtraduite_no3_no2
                    >= valeur_ref.limite_qualite_no3_no2
                    OR prels.valtraduite_no3 / 50 + prels.valtraduite_no2 / 3
                    >= valeur_ref.limite_qualite_no3_no2
                    THEN prels.referenceprel
            END
        )::float
        /
        COUNT(DISTINCT prels.referenceprel)::float
    ) AS ratio_depassements

FROM prels
CROSS JOIN valeur_ref
GROUP BY prels.cdreseau, prels.annee
