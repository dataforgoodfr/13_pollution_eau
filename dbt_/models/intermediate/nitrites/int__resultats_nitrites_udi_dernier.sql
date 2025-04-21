WITH
last_pvl AS (
    SELECT
        cdreseau,
        referenceprel,
        datetimeprel,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau, cdparametresiseeaux
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

split_nitrites AS (
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

split_nitrites_with_ref AS (
    SELECT
        split_nitrites.cdreseau,
        split_nitrites.categorie,
        split_nitrites.nb_parametres,
        split_nitrites.dernier_prel_datetime,
        valeur_ref.limite_qualite_no3,
        valeur_ref.limite_qualite_no2,
        valeur_ref.limite_qualite_no3_no2,
        split_nitrites.valtraduite_no3_no2,
        split_nitrites.valtraduite_no3,
        split_nitrites.valtraduite_no2
    FROM
        split_nitrites
    CROSS JOIN
        valeur_ref
)

SELECT
    split_nitrites_with_ref.cdreseau,
    split_nitrites_with_ref.categorie,
    'dernier_prel' AS periode,
    split_nitrites_with_ref.dernier_prel_datetime,
    split_nitrites_with_ref.nb_parametres,
    CASE
        WHEN -- Si nitrates (no3) et pas nitrites (no2)
            split_nitrites_with_ref.valtraduite_no2 IS NULL
            AND
            split_nitrites_with_ref.valtraduite_no3
            < split_nitrites_with_ref.limite_qualite_no3
            THEN 'inf_limite_qualite'
        WHEN
            split_nitrites_with_ref.valtraduite_no2 IS NULL
            AND
            split_nitrites_with_ref.valtraduite_no3
            >= split_nitrites_with_ref.limite_qualite_no3
            THEN 'sup_limite_qualite'
        WHEN -- Si nitrates (no3) ET nitrites (no2)
            split_nitrites_with_ref.valtraduite_no2 IS NOT NULL
            AND (
                split_nitrites_with_ref.valtraduite_no3
                >= split_nitrites_with_ref.limite_qualite_no3
                OR split_nitrites_with_ref.valtraduite_no2
                >= split_nitrites_with_ref.limite_qualite_no2
                OR COALESCE(
                    split_nitrites_with_ref.valtraduite_no3_no2,
                    (
                        split_nitrites_with_ref.valtraduite_no3 / 50
                        + split_nitrites_with_ref.valtraduite_no2 / 3
                    )
                )
                >= split_nitrites_with_ref.limite_qualite_no3_no2
            )
            THEN 'sup_limite_qualite'
        WHEN
            split_nitrites_with_ref.valtraduite_no2 IS NOT NULL
            AND split_nitrites_with_ref.valtraduite_no3
            < split_nitrites_with_ref.limite_qualite_no3
            AND split_nitrites_with_ref.valtraduite_no2
            < split_nitrites_with_ref.limite_qualite_no2
            AND COALESCE(
                split_nitrites_with_ref.valtraduite_no3_no2,
                (
                    split_nitrites_with_ref.valtraduite_no3 / 50
                    + split_nitrites_with_ref.valtraduite_no2 / 3
                )
            )
            < split_nitrites_with_ref.limite_qualite_no3_no2
            THEN 'inf_limite_qualite'
        ELSE 'erreur'
    END AS resultat
FROM
    split_nitrites_with_ref
