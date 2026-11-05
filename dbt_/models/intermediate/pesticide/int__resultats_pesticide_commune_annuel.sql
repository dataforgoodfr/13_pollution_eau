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
        valeur_sanitaire_1,
        valeur_sanitaire_1_type
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
            -- Vraies valeurs sanitaires uniquement : la valeur recommandée par
            -- le HCSP en l'absence de valeur sanitaire est un seuil d'alerte
            -- (son dépassement reste compté dans nb_depassements, car elle est
            -- supérieure à la limite de qualité).
            WHEN
                valtraduite IS NOT NULL
                AND valtraduite > valeur_sanitaire_1
                AND valeur_sanitaire_1_type IS DISTINCT FROM 'hcsp'
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
