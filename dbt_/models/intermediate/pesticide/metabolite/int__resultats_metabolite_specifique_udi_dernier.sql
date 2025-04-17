WITH latest_metabolite_results AS (
    SELECT
        *,
        CASE
            WHEN cdparametresiseeaux IN ('ESAMTC', 'MTCESA') THEN 'metabolite_esa_metolachlore'
            WHEN
                cdparametresiseeaux IN ('471811R', 'R471811')
                THEN 'metabolite_chlorothalonil_r471811'
            WHEN cdparametresiseeaux = 'CLDZ_D' THEN 'metabolite_chloridazone_desphenyl'
            WHEN cdparametresiseeaux = 'CLDZ_MD' THEN 'metabolite_chloridazone_methyl_desphenyl'
            WHEN cdparametresiseeaux = 'ADET' THEN 'metabolite_atrazine_desethyl'
        END AS type_metabolite,
        ROW_NUMBER() OVER (
            PARTITION BY
                cdreseau,
                CASE
                    WHEN
                        cdparametresiseeaux IN ('ESAMTC', 'MTCESA')
                        THEN 'metabolite_esa_metolachlore'
                    WHEN
                        cdparametresiseeaux IN ('471811R', 'R471811')
                        THEN 'metabolite_chlorothalonil_r471811'
                    WHEN cdparametresiseeaux = 'CLDZ_D'
                        THEN 'metabolite_chloridazone_desphenyl'
                    WHEN
                        cdparametresiseeaux = 'CLDZ_MD'
                        THEN 'metabolite_chloridazone_methyl_desphenyl'
                    WHEN cdparametresiseeaux = 'ADET'
                        THEN 'metabolite_atrazine_desethyl'
                END
            ORDER BY datetimeprel DESC
        ) AS row_number

    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'metabolite'
        AND
        cdparametresiseeaux IN (
            'ESAMTC', 'MTCESA', '471811R', 'R471811', 'CLDZ_D', 'CLDZ_MD', 'ADET'
        )
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)


SELECT
    cdreseau,
    type_metabolite AS categorie,
    'dernier_prel' AS periode,
    datetimeprel AS dernier_prel_datetime,
    valtraduite AS dernier_prel_valeur,
    1 AS nb_parametres,
    CASE
        WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
        WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
        WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
        -- On applique le seuil de 0.1 uniquement pour des métabolites spécifiques
        WHEN
            valtraduite >= 0.1
            AND type_metabolite IN (
                'metabolite_esa_metolachlore', 'metabolite_chlorothalonil_r471811'
            )
            THEN 'inf_limite_qualite_sup_0_1'
        WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat
FROM latest_metabolite_results
WHERE row_number = 1
