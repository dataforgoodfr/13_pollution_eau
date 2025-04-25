WITH
last_pvl AS (
    SELECT
        cdreseau,
        referenceprel,
        datetimeprel,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'nitrate'
        AND cdparametresiseeaux = 'NO3'
        AND -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
        AND valtraduite IS NOT NULL
        -- Cf cas cdreseau IN( '034005906') , referenceprel= 03400327764
),

valeur_ref AS (
    SELECT
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no3,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO3_NO2'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no3_no2,
        MAX(
            CASE
                WHEN
                    cdparametresiseeaux = 'NO2'
                    THEN limite_qualite
            END
        ) AS limite_qualite_no2
    FROM
        {{ ref('int__valeurs_de_reference') }}
    WHERE
        categorie_1 = 'nitrate'
),

split_nitrate AS (
    SELECT
        resultats.cdreseau,
        resultats.categorie,
        resultats.datetimeprel AS dernier_prel_datetime,
        COUNT(DISTINCT resultats.cdparametresiseeaux) AS nb_parametres,
        MAX(
            CASE
                WHEN
                    resultats.cdparametresiseeaux = 'NO3'
                    THEN resultats.valtraduite
            END
        ) AS valtraduite_no3,
        MAX(
            CASE
                WHEN
                    resultats.cdparametresiseeaux = 'NO2'
                    THEN resultats.valtraduite
            END
        ) AS valtraduite_no2,
        MAX(
            CASE
                WHEN
                    resultats.cdparametresiseeaux = 'NO3_NO2'
                    THEN resultats.valtraduite
            END
        ) AS valtraduite_no3_no2
    FROM
        last_pvl
    LEFT JOIN
        {{ ref('int__resultats_udi_communes') }} AS resultats
        ON
            last_pvl.cdreseau = resultats.cdreseau
            AND last_pvl.referenceprel = resultats.referenceprel
    WHERE
        last_pvl.row_number = 1
        -- on ne veut que le dernier prélèvement
        AND resultats.categorie = 'nitrate'
        -- on ne veut que les résultats associé aux nitrates/nitrites
    GROUP BY
        resultats.cdreseau,
        resultats.categorie,
        resultats.datetimeprel
),

split_nitrate_with_ref AS (
    SELECT
        split_nitrate.cdreseau,
        split_nitrate.categorie,
        split_nitrate.nb_parametres,
        split_nitrate.dernier_prel_datetime,
        valeur_ref.limite_qualite_no3,
        valeur_ref.limite_qualite_no2,
        valeur_ref.limite_qualite_no3_no2,
        split_nitrate.valtraduite_no3_no2,
        split_nitrate.valtraduite_no3,
        split_nitrate.valtraduite_no2
    FROM
        split_nitrate
    CROSS JOIN
        valeur_ref
)

SELECT
    cdreseau,
    categorie,
    'dernier_prel' AS periode,
    dernier_prel_datetime,
    valtraduite_no3 AS dernier_prel_valeur,
    nb_parametres,
    CASE
        WHEN -- Si nitrates (no3) et pas nitrites (no2)
            valtraduite_no2 IS NULL
            AND
            valtraduite_no3
            < limite_qualite_no3
            THEN 'inf_limite_qualite'
        WHEN
            valtraduite_no2 IS NULL
            AND
            valtraduite_no3
            >= limite_qualite_no3
            THEN 'sup_limite_qualite'
        WHEN -- Si nitrates (no3) ET nitrites (no2)
            valtraduite_no2 IS NOT NULL
            AND (
                valtraduite_no3
                >= limite_qualite_no3
                OR valtraduite_no2
                >= limite_qualite_no2
                OR COALESCE(
                    valtraduite_no3_no2,
                    (
                        valtraduite_no3 / 50
                        + valtraduite_no2 / 3
                    )
                )
                >= limite_qualite_no3_no2
            )
            THEN 'sup_limite_qualite'
        WHEN
            valtraduite_no2 IS NOT NULL
            AND valtraduite_no3
            < limite_qualite_no3
            AND valtraduite_no2
            < limite_qualite_no2
            AND COALESCE(
                valtraduite_no3_no2,
                (
                    valtraduite_no3 / 50
                    + valtraduite_no2 / 3
                )
            )
            < limite_qualite_no3_no2
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat
FROM
    split_nitrate_with_ref
