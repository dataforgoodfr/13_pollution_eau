WITH
pesticide_prels AS (
    SELECT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1,
        valeur_sanitaire_1_type,
        -- Valeur maximale de la substance dans l'année, pour parametres_detectes
        MAX(valtraduite) OVER (
            PARTITION BY cdreseau, de_partition, cdparametresiseeaux
        ) AS valeur_max_annee
    FROM
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pesticide'
)

SELECT
    cdreseau,
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
    -- Substances quantifiées dans l'année (valeur max), plus le total PESTOT
    TO_JSON(MAP_CONCAT(
        MAP_FROM_ENTRIES(COALESCE(
            LIST(
                DISTINCT { 'key': cdparametresiseeaux, 'value': valeur_max_annee }
            ) FILTER (WHERE valtraduite > 0 AND cdparametresiseeaux != 'PESTOT'),
            []
        )),
        MAP(
            ['PESTOT'],
            [
                MAX(
                    CASE
                        WHEN cdparametresiseeaux = 'PESTOT' THEN valtraduite
                        ELSE 0
                    END
                )
            ]
        )
    )) AS parametres_detectes,
    MAX(datetimeprel) AS date_dernier_prel

FROM pesticide_prels

GROUP BY cdreseau, annee
