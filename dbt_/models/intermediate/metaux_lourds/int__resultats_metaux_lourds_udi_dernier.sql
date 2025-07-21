-- Ici on ne garde que le dernier prélèvement
-- pour chaque UDI dans la dernière année
WITH metaux_lourds_dernier_prel AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        limite_qualite,
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
        cdparametresiseeaux IN ('PB', 'AS')
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel
        < INTERVAL 1 YEAR
)

-- Ici on ne prend que le prélèvement le plus récent (avec row_number = 1)
-- pour chaque type de métaux lourds
SELECT
    cdreseau,
    datetimeprel AS date_dernier_prel,
    'dernier_prel' AS periode,
    1 AS nb_parametres,
    CASE
        WHEN
            cdparametresiseeaux = 'PB'
            THEN 'metaux_lourds_pb'
        WHEN
            cdparametresiseeaux = 'AS'
            THEN 'metaux_lourds_as'
    END AS categorie,
    CASE
        WHEN
            -- Pas de distinction PB/AS car même résultat
            valtraduite IS NULL
            OR valtraduite = 0
            THEN 'non_quantifie'
        WHEN
            cdparametresiseeaux = 'PB'
            AND valtraduite >= limite_qualite
            THEN 'sup_limite_qualite'
        WHEN
            -- 5 est la future limite de qualité appliquée
            -- à partir de 2036
            cdparametresiseeaux = 'PB'
            AND valtraduite >= 5
            AND valtraduite < limite_qualite
            THEN 'sup_limite_qualite_2036'
        WHEN
            cdparametresiseeaux = 'PB'
            AND valtraduite < 5
            THEN 'inf_limite_qualite'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite >= valeur_sanitaire_1
            THEN 'sup_valeur_sanitaire'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite >= limite_qualite
            AND valtraduite < valeur_sanitaire_1
            THEN 'sup_limite_qualite'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite < limite_qualite
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat,
    JSON_OBJECT(CASE WHEN valtraduite > 0 THEN cdparametresiseeaux END, valtraduite)
        AS parametres_detectes
FROM
    metaux_lourds_dernier_prel
WHERE
    row_number = 1
