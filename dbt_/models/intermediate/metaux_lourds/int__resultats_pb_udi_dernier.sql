-- Ici on ne garde que le dernier prélèvement pour chaque UDI
-- dans la dernière année
WITH pb_dernier_prel AS (
    SELECT
        *,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        cdparametresiseeaux = 'PB'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel
        < INTERVAL 1 YEAR
),

-- Ici on reprend les résultats pour chaque dernier prélèvement pour chaque UDI
resultats_udi_pb_dernier_prel AS (
    SELECT
        pb_dernier_prel.referenceprel,
        pb_dernier_prel.cdparametresiseeaux,
        pb_dernier_prel.valtraduite,
        pb_dernier_prel.categorie,
        pb_dernier_prel.limite_qualite,
        pb_dernier_prel.valeur_sanitaire_1,
        pb_dernier_prel.cdreseau,
        pb_dernier_prel.datetimeprel
    FROM
        pb_dernier_prel
    WHERE
        -- On ne garde que le dernier prélèvement
        -- pour chaque UDI (cdreseau)
        pb_dernier_prel.row_number = 1
)

-- Puis on ajoute le résultat pour chaque cas
SELECT
    resultats_udi_pb_dernier_prel.categorie,
    resultats_udi_pb_dernier_prel.cdreseau,
    resultats_udi_pb_dernier_prel.datetimeprel AS dernier_prel_datetime,
    'dernier_prel' AS periode,
    resultats_udi_pb_dernier_prel.valtraduite AS dernier_prel_valeur,
    CASE
        WHEN
            resultats_udi_pb_dernier_prel.valtraduite IS NULL
            OR resultats_udi_pb_dernier_prel.valtraduite = 0
            THEN 'aucun_parametre_quantifie'
        WHEN
            resultats_udi_pb_dernier_prel.valtraduite > 10
            THEN 'sup_limite_qualite'
        WHEN
            resultats_udi_pb_dernier_prel.valtraduite >= 5
            AND resultats_udi_pb_dernier_prel.valtraduite < 10
            THEN 'sup_5_inf_10_limite_2036'
        WHEN
            resultats_udi_pb_dernier_prel.valtraduite < 5
            THEN 'inf_5'
        ELSE 'erreur'
    END AS resultat
FROM
    resultats_udi_pb_dernier_prel
ORDER BY
    resultats_udi_pb_dernier_prel.cdreseau
