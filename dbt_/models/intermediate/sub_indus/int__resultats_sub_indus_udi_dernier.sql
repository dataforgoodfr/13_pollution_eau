WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        valeur_sanitaire_1,
        valeur_sanitaire_2,
        datetimeprel,
        valtraduite,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        cdparametresiseeaux IN ('14DAN', 'PCLAT')
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)

SELECT
    cdreseau,
    'dernier_prel' AS periode,
    datetimeprel AS dernier_prel_datetime,
    valtraduite AS dernier_prel_valeur,
    1 AS nb_parametres,
    CASE
        WHEN cdparametresiseeaux = '14DAN' THEN 'sub_indus_14dioxane'
        WHEN cdparametresiseeaux = 'PCLAT' THEN 'sub_indus_perchlorate'
    END AS categorie,
    CASE
        WHEN
            valtraduite = 0 OR valtraduite IS NULL
            THEN 'non_quantifie'
        WHEN
            valtraduite >= valeur_sanitaire_2
            THEN 'sup_valeur_sanitaire_2'
        WHEN
            -- by construction, valeur_sanitaire_2 > valeur_sanitaire_1
            -- so here the result is actually:
            -- valeur_sanitaire_1 < valtraduite < valeur_sanitaire_2
            valtraduite >= valeur_sanitaire_1
            THEN 'sup_valeur_sanitaire'
        WHEN
            valtraduite < valeur_sanitaire_1
            THEN 'inf_valeur_sanitaire'
        ELSE 'error'
    END AS resultat
FROM
    last_pvl
WHERE
    row_number = 1
