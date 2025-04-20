-- Ici on ne garde que le dernier prélèvement
-- pour chaque UDI dans la dernière année
WITH metaux_lourds_dernier_prel AS (
    SELECT
        *,
        ROW_NUMBER()
            OVER (
                PARTITION BY
                    cdreseau,
                    cdparametresiseeaux
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
    datetimeprel AS dernier_prel_datetime,
    'dernier_prel' AS periode,
    valtraduite AS dernier_prel_valeur,
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
            AND valtraduite >= 10
            THEN 'sup_limite_qualite'
        WHEN
            cdparametresiseeaux = 'PB'
            AND valtraduite >= 5
            AND valtraduite < 10
            THEN 'sup_limite_qualite_2036'
        WHEN
            cdparametresiseeaux = 'PB'
            AND valtraduite < 5
            THEN 'inf_5'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite >= 13
            THEN 'sup_limite_sanitaire'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite >= 10
            AND valtraduite < 13
            THEN 'as_sup_10_inf_13'
        WHEN
            cdparametresiseeaux = 'AS'
            AND valtraduite < 10
            THEN 'inf_10'
        ELSE 'erreur'
    END AS resultat
FROM
    metaux_lourds_dernier_prel
WHERE
    row_number = 1
ORDER BY
    cdreseau
