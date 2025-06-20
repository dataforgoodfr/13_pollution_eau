WITH
metabolite_specifique_prels AS (
    SELECT DISTINCT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1,
        CASE
            WHEN cdparametresiseeaux IN ('ESAMTC', 'MTCESA') THEN 'metabolite_esa_metolachlore'
            WHEN
                cdparametresiseeaux IN ('471811R', 'R471811')
                THEN 'metabolite_chlorothalonil_r471811'
            WHEN cdparametresiseeaux = 'CLDZ_D' THEN 'metabolite_chloridazone_desphenyl'
            WHEN cdparametresiseeaux = 'CLDZ_MD' THEN 'metabolite_chloridazone_methyl_desphenyl'
            WHEN cdparametresiseeaux = 'ADET' THEN 'metabolite_atrazine_desethyl'
        END AS type_metabolite
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'metabolite'
        AND
        cdparametresiseeaux IN (
            'ESAMTC', 'MTCESA', '471811R', 'R471811', 'CLDZ_D', 'CLDZ_MD', 'ADET'
        )
)

SELECT
    cdreseau,
    annee,
    type_metabolite AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite >= limite_qualite
                THEN referenceprel
        END
    ) AS nb_depassements,
    COUNT(
        DISTINCT
        CASE
            WHEN
                valtraduite IS NOT NULL AND valtraduite >= valeur_sanitaire_1
                THEN referenceprel
        END
    ) AS nb_sup_valeur_sanitaire,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT
            CASE
                WHEN
                    valtraduite IS NOT NULL AND valtraduite >= limite_qualite
                    THEN referenceprel
            END
        )::float
        /
        COUNT(DISTINCT referenceprel)::float
    ) AS ratio_limite_qualite

FROM metabolite_specifique_prels

GROUP BY cdreseau, annee, type_metabolite
