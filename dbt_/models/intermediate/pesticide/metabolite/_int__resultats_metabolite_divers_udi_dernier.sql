--------------------------------------------------------------
-- Tous les autres métabolites que ceux utilisés             -
-- dans int__resultats_metabolite_specifique_udi_dernier.sql -
--------------------------------------------------------------

WITH autres_metabolites_results AS (
    SELECT *
    FROM {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'pesticide'
        AND
        categorie_2 = 'metabolite'
        AND
        cdparametresiseeaux NOT IN (
            'ESAMTC',
            'MTCESA',
            '471811R',
            'R471811',
            'CLDZ_D',
            'CLDZ_MD',
            'ADET'
        )
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
),

latest_datetimeprel_by_cdreseau AS (
    SELECT
        cdreseau,
        MAX(datetimeprel) AS max_datetimeprel
    FROM autres_metabolites_results
    GROUP BY cdreseau
),

latest_referenceprel_results AS (
    SELECT
        r.cdreseau,
        MAX(r.referenceprel) AS referenceprel
    FROM autres_metabolites_results AS r
    INNER JOIN latest_datetimeprel_by_cdreseau AS latest
        ON
            r.cdreseau = latest.cdreseau
            AND r.datetimeprel = latest.max_datetimeprel
    GROUP BY r.cdreseau
),

latest_autres_metabolites_results AS (
    -- latest_autres_metabolites_results contient, pour chaque cdreseau,
    -- les prélèvements du dernier referenceprel
    SELECT r.*
    FROM autres_metabolites_results AS r
    INNER JOIN latest_referenceprel_results AS latest
        ON
            r.cdreseau = latest.cdreseau
            AND
            r.referenceprel = latest.referenceprel
)



SELECT
    cdreseau,
    'metabolite_divers' AS categorie,
    datetimeprel AS dernier_prel_datetime,
    'dernier_prel' AS periode,
    CASE
        WHEN
            BOOL_AND(valtraduite IS NULL OR valtraduite = 0)
            THEN 'aucun_parametre_quantifie'
        WHEN BOOL_OR(valeur_sanitaire_1 IS NOT NULL AND valtraduite >= valeur_sanitaire_1)
            THEN 'sup_valeur_sanitaire'
        WHEN
            -- au moins 1 métabolite pertinent ou pertinent par défaut > 0,1 µg/L
            BOOL_OR(
                CASE
                    WHEN categorie_3 = 'pertinent' OR categorie_3 = 'pertinent_par_defaut'
                        THEN valtraduite >= limite_qualite
                    ELSE FALSE
                END
            )
            OR
            -- la somme des métabolites pertinents et pertinents par défaut > 0,5 µg/L
            SUM(
                CASE
                    WHEN
                        categorie_3 = 'pertinent' OR categorie_3 = 'pertinent_par_defaut'
                        THEN valtraduite
                    ELSE 0
                END
            ) >= 0.5
            OR
            -- au moins 1 métabolite non pertinent > 0,9 µg/L
            BOOL_OR(
                CASE
                    WHEN
                        categorie_3 = 'non_pertinent'
                        THEN valtraduite >= 0.9
                    ELSE FALSE
                END
            )
            THEN 'sup_limite_qualite'
        WHEN
            -- tous les métabolites pertinents ou pertinents par défaut < 0,1 µg/L
            BOOL_AND(
                CASE
                    WHEN
                        categorie_3 = 'pertinent' OR categorie_3 = 'pertinent_par_defaut'
                        THEN valtraduite < limite_qualite
                    ELSE
                        -- on ne s'intéresse pas à ces cas, donc on retourne
                        -- TRUE pour ne pas bloquer la condition BOOL_AND
                        TRUE
                END
            )
            AND
            -- la somme des métabolites pertinents et pertinents par défaut < 0,5 µg/L
            SUM(
                CASE
                    WHEN
                        categorie_3 = 'pertinent' OR categorie_3 = 'pertinent_par_defaut'
                        THEN valtraduite
                    ELSE 0
                END
            ) < 0.5
            AND
            -- tous les métabolites non pertinents < 0.9 µg/L
            BOOL_AND(
                CASE
                    WHEN
                        categorie_3 = 'non_pertinent'
                        THEN valtraduite < 0.9
                    ELSE
                        -- on ne s'intéresse pas à ces cas, donc on retourne
                        -- TRUE pour ne pas bloquer la condition BOOL_AND
                        TRUE
                END
            )
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat

FROM latest_autres_metabolites_results
GROUP BY cdreseau
