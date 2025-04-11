----------------------
-- ESA-metolachlore --
----------------------

WITH latest_esa_metolachlore_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        -- Le ESA metolachlore peut avoir deux cdparametresiseeaux
        cdparametresiseeaux IN ('ESAMTC', 'MTCESA')
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

esa_metolachlore_results AS (
    SELECT
        cdreseau,
        'metabolite_esa_metolachlore' AS categorie,
        datetimeprel AS dernier_prel_datetime,
        'dernier_prel' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
            WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
            WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
            WHEN valtraduite >= 0.1 THEN 'inf_limite_qualite_sup_0_1'
            WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
            ELSE 'erreur'
        END AS resultat
    FROM latest_esa_metolachlore_results
    WHERE row_number = 1
),

----------------------------
-- Chlorothalonil R471811 --
----------------------------

latest_chlorothalonil_r471811_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        -- Chlorothalonil R471811 peut avoir deux cdparametresiseeaux
        cdparametresiseeaux IN ('471811R', 'R471811')
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

chlorothalonil_results AS (
    SELECT
        cdreseau,
        'metabolite_chlorothalonil_r471811' AS categorie,
        datetimeprel AS dernier_prel_datetime,
        'dernier_prel' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
            WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
            WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
            WHEN valtraduite >= 0.1 THEN 'inf_limite_qualite_sup_0_1'
            WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
            ELSE 'erreur'
        END AS resultat
    FROM latest_chlorothalonil_r471811_results
    WHERE row_number = 1
),

----------------------------
-- Chloridazone desphényl --
----------------------------

latest_chloridazone_d_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        cdparametresiseeaux = 'CLDZ_D'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

chloridazone_d_results AS (
    SELECT
        cdreseau,
        'metabolite_chloridazone_desphenyl' AS categorie,
        datetimeprel AS dernier_prel_datetime,
        'dernier_prel' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
            WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
            WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
            WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
            ELSE 'erreur'
        END AS resultat
    FROM latest_chloridazone_d_results
    WHERE row_number = 1
),

-----------------------------------
-- Chloridazone methyl-desphényl --
-----------------------------------

latest_chloridazone_md_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        cdparametresiseeaux = 'CLDZ_MD'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

chloridazone_md_results AS (
    SELECT
        cdreseau,
        'metabolite_chloridazone_methyl_desphenyl' AS categorie,
        datetimeprel AS dernier_prel_datetime,
        'dernier_prel' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
            WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
            WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
            WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
            ELSE
                'erreur'
        END AS resultat
    FROM latest_chloridazone_md_results
    WHERE row_number = 1
),

-----------------------
-- Atrazine déséthyl --
-----------------------

latest_atrazine_results AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY cdreseau
            ORDER BY datetimeprel DESC
        ) AS row_number
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        cdparametresiseeaux = 'ADET'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

atrazine_results AS (
    SELECT
        cdreseau,
        'metabolite_atrazine_desethyl' AS categorie,
        datetimeprel AS dernier_prel_datetime,
        'dernier_prel' AS periode,
        CASE
            WHEN valtraduite = 0 OR valtraduite IS null THEN 'non_quantifie'
            WHEN valtraduite >= valeur_sanitaire_1 THEN 'sup_valeur_sanitaire'
            WHEN valtraduite >= limite_qualite THEN 'sup_limite_qualite'
            WHEN valtraduite < limite_qualite THEN 'inf_limite_qualite'
            ELSE 'erreur'
        END AS resultat
    FROM latest_atrazine_results
    WHERE row_number = 1
)

-- Assemblage des résultats

SELECT * FROM esa_metolachlore_results
UNION ALL
SELECT * FROM chlorothalonil_results
UNION ALL
SELECT * FROM chloridazone_d_results
UNION ALL
SELECT * FROM chloridazone_md_results
UNION ALL
SELECT * FROM atrazine_results
