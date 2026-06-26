WITH
pesticide_prels AS (
    SELECT
        de_partition AS annee,
        inseecommune,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1
    FROM
        {{ ref('int__resultats_communes') }}
    WHERE
        categorie = 'pesticide'
)

SELECT
    inseecommune,
    annee,
    'pesticide' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite > limite_qualite
                THEN referenceprel
        END
    ) AS nb_depassements,
    COUNT(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite > valeur_sanitaire_1
                THEN referenceprel
        END
    ) AS nb_sup_valeur_sanitaire,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT
            CASE
                WHEN
                    valtraduite IS NOT NULL AND valtraduite > limite_qualite
                    THEN referenceprel
            END
        )::float
        /
        COUNT(DISTINCT referenceprel)::float
    ) AS ratio_limite_qualite,
    TO_JSON({
        'PESTOT': MAX(
            CASE WHEN cdparametresiseeaux = 'PESTOT' THEN valtraduite ELSE 0 END
        )
    }) AS parametres_detectes,
    MAX(datetimeprel) AS date_dernier_prel

FROM pesticide_prels

GROUP BY inseecommune, annee
