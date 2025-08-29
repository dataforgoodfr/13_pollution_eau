WITH
last_pvl AS (
    SELECT DISTINCT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        categorie_2,
        categorie_3,
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
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
        AND
        -- On exclut le paramètre PESTOT qui est un total de pesticides.
        -- On recalcule un total pesticide plus adapté plus bas.
        -- Par contre, dans le bilan annuel (int__resultats_pesticide_udi_annuel.sql), on le garde
        -- (au lieu de le recalculer) car il a changé dans le temps et on veut pas gérer
        -- l'historique des règles de calcul.
        cdparametresiseeaux != 'PESTOT'
),

aggregated AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        categorie_2,
        categorie_3,
        MAX(valtraduite) AS valtraduite,
        MAX(limite_qualite) AS limite_qualite,
        MAX(valeur_sanitaire_1) AS valeur_sanitaire_1,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl
    WHERE row_number = 1
    GROUP BY cdreseau, cdparametresiseeaux, categorie_2, categorie_3
),

-- ajout d'une colonne total pesticide (somme des substances actives + métabolites pertinents)
with_total_pesticide AS (
    SELECT
        *,
        SUM(
            CASE
                WHEN
                    (
                        categorie_2 = 'sub_active'
                        OR (categorie_2 = 'metabolite' AND categorie_3 = 'pertinent_par_defaut')
                        OR (categorie_2 = 'metabolite' AND categorie_3 = 'pertinent')
                    )
                    AND valtraduite IS NOT NULL
                    THEN valtraduite
                ELSE 0
            END
        ) OVER (PARTITION BY cdreseau) AS total_pesticide
    FROM aggregated
)

SELECT
    cdreseau,
    'pesticide' AS categorie,
    'dernier_prel' AS periode,
    MAX(datetimeprel) AS date_dernier_prel,
    COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,
    CASE
        WHEN BOOL_AND(valtraduite IS NULL OR valtraduite = 0) THEN 'non_quantifie'
        WHEN
            BOOL_OR(valtraduite >= valeur_sanitaire_1)
            THEN 'sup_valeur_sanitaire'
        WHEN
            BOOL_OR(valtraduite >= limite_qualite)
            OR MAX(total_pesticide) >= 0.5
            THEN 'sup_limite_qualite'
        WHEN
            BOOL_OR(
                (limite_qualite IS NOT NULL AND valtraduite < limite_qualite)
                OR (valeur_sanitaire_1 IS NOT NULL AND valtraduite < valeur_sanitaire_1)
            )
            THEN 'inf_limite_qualite' -- TODO: rename to 'inf_limites' ?
        ELSE 'erreur'
    END AS resultat,
    TO_JSON(
        MAP(
            LIST(
                cdparametresiseeaux
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            ) || ['TOTALPESTICIDE'],
            LIST(
                valtraduite
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            ) || [MAX(total_pesticide)]
        )
    ) AS parametres_detectes

FROM with_total_pesticide
GROUP BY cdreseau
