WITH
last_pvl AS (
    SELECT DISTINCT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1,
        datetimeprel,
        DENSE_RANK()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number

    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'sub_active'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
)

SELECT
    cdreseau,
    'sub_active' AS categorie,
    'dernier_prel' AS periode,
    MAX(datetimeprel) AS dernier_prel_datetime,
    MAX(valtraduite) AS dernier_prel_valeur,
    COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
    CASE
        WHEN BOOL_AND(valtraduite IS NULL OR valtraduite = 0) THEN 'non_quantifie'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite >= valeur_sanitaire_1)
            THEN 'sup_valeur_sanitaire'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite >= limite_qualite)
            THEN 'sup_limite_qualite'
        WHEN
            BOOL_OR(valtraduite IS NOT NULL AND valtraduite < limite_qualite)
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat

FROM last_pvl
WHERE row_number = 1
GROUP BY cdreseau
