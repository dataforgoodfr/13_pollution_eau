WITH
metabolite_prels AS (
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'metabolite'
)

SELECT
    cdreseau,
    annee,
    'metabolite' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(
        DISTINCT
        CASE
            -- Chlorothalonil R471811 : changement de limite qualité en 2025, on hard code une
            -- limite pour les années précédentes
            WHEN
                valtraduite IS NOT NULL
                AND cdparametresiseeaux IN ('471811R', 'R471811')
                AND annee < 2025
                AND valtraduite > 0.1
                THEN referenceprel
            -- ESA métolachlore : changement de limite qualité en 2023, on hard code une
            -- limite pour les années précédentes
            WHEN
                valtraduite IS NOT NULL
                AND cdparametresiseeaux IN ('ESAMTC', 'MTCESA')
                AND annee < 2023
                AND valtraduite > 0.1
                THEN referenceprel
            -- Metolachlor NOA 413173 : change de limite qualité en 2023, on hard code une
            -- limite pour les années précédentes
            WHEN
                valtraduite IS NOT NULL
                AND cdparametresiseeaux IN ('MTCNOA', 'NOAMTC')
                AND annee < 2023
                AND valtraduite > 0.1
                THEN referenceprel
            -- OXA métolachlore : change de limite qualité en 2022, on hard code une
            -- limite pour les années précédentes
            WHEN
                valtraduite IS NOT NULL
                AND cdparametresiseeaux IN ('OXAMTC', 'MTCOXA')
                AND annee < 2022
                AND valtraduite > 0.1
                THEN referenceprel
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
                -- Chlorothalonil R471811 : changement de limite qualité en 2025, on hard code une
                -- limite pour les années précédentes
                WHEN
                    valtraduite IS NOT NULL
                    AND cdparametresiseeaux IN ('471811R', 'R471811')
                    AND annee < 2025
                    AND valtraduite > 0.1
                    THEN referenceprel
                -- ESA métolachlore : changement de limite qualité en 2023, on hard code une
                -- limite pour les années précédentes
                WHEN
                    valtraduite IS NOT NULL
                    AND cdparametresiseeaux IN ('ESAMTC', 'MTCESA')
                    AND annee < 2023
                    AND valtraduite > 0.1
                    THEN referenceprel
                -- Metolachlor NOA 413173 : change de limite qualité en 2023, on hard code une
                -- limite pour les années précédentes
                WHEN
                    valtraduite IS NOT NULL
                    AND cdparametresiseeaux IN ('MTCNOA', 'NOAMTC')
                    AND annee < 2023
                    AND valtraduite > 0.1
                    THEN referenceprel
                -- OXA métolachlore : change de limite qualité en 2022, on hard code une
                -- limite pour les années précédentes
                WHEN
                    valtraduite IS NOT NULL
                    AND cdparametresiseeaux IN ('OXAMTC', 'MTCOXA')
                    AND annee < 2022
                    AND valtraduite > 0.1
                    THEN referenceprel
                WHEN
                    valtraduite IS NOT NULL AND valtraduite > limite_qualite
                    THEN referenceprel
            END
        )::float
        /
        COUNT(DISTINCT referenceprel)::float
    ) AS ratio_limite_qualite

FROM metabolite_prels

GROUP BY cdreseau, annee
