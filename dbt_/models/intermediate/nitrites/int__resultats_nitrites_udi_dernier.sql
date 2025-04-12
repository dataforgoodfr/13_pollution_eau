WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        limite_qualite,
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
        categorie = 'nitrate'
        AND
        -- On garde les prélèvements de moins d'un an
        CURRENT_DATE - datetimeprel < INTERVAL 1 YEAR
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
        last_pvl.cdreseau,
        last_pvl.categorie,
        COUNT(DISTINCT last_pvl.cdparametresiseeaux) AS nb_parametres,
        MAX(last_pvl.datetimeprel) AS dernier_prel_datetime,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no3,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO2'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no2,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3_NO2'
                    THEN last_pvl.valtraduite
            END
        ) AS valtraduite_no3_no2,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO3'
                    THEN last_pvl.datetimeprel
            END
        ) AS dernier_prel_datetime_n03,
        MAX(
            CASE
                WHEN
                    last_pvl.cdparametresiseeaux = 'NO2'
                    THEN last_pvl.datetimeprel
            END
        ) AS dernier_prel_datetime_n02
    FROM
        last_pvl
    WHERE
        last_pvl.row_number = 1
    GROUP BY
        last_pvl.cdreseau,
        last_pvl.categorie
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
        -- Si les mesures sont espacées de plus de 30 jours 
        -- on garde que la plus récente uniquement 
        IF(
            DATE_DIFF(
                'day',
                split_nitrites.dernier_prel_datetime_n03,
                split_nitrites.dernier_prel_datetime_n02
            ) > 30,
            NULL,
            split_nitrites.valtraduite_no3
        ) AS valtraduite_no3,
        IF(
            DATE_DIFF(
                'day',
                split_nitrites.dernier_prel_datetime_n02,
                split_nitrites.dernier_prel_datetime_n03
            ) > 30,
            NULL,
            split_nitrites.valtraduite_no2
        ) AS valtraduite_no2
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
        WHEN
            split_nitrites_with_ref.valtraduite_no3
            < split_nitrites_with_ref.limite_qualite_no3
            AND split_nitrites_with_ref.valtraduite_no2
            < split_nitrites_with_ref.limite_qualite_no2
            -- Si on n'a pas valtraduite_no3_no2, on le calcule
            -- si l'une des valeurs de la somme est NULL le total sera NULL 
            AND COALESCE(
                split_nitrites_with_ref.valtraduite_no3_no2,
                (
                    split_nitrites_with_ref.valtraduite_no3 / 50
                    + split_nitrites_with_ref.valtraduite_no2 / 3
                )
            )
            < split_nitrites_with_ref.limite_qualite_no3_no2
            THEN 'conforme'
        WHEN
            split_nitrites_with_ref.valtraduite_no3
            >= split_nitrites_with_ref.limite_qualite_no3
            OR split_nitrites_with_ref.valtraduite_no2
            >= split_nitrites_with_ref.limite_qualite_no2
            -- Si on n'a pas valtraduite_no3_no2, on le calcule
            -- si l'une des valeurs de la somme est NULL le total sera NULL 
            OR COALESCE(
                split_nitrites_with_ref.valtraduite_no3_no2,
                (
                    split_nitrites_with_ref.valtraduite_no3 / 50
                    + split_nitrites_with_ref.valtraduite_no2 / 3
                )
            )
            >= split_nitrites_with_ref.limite_qualite_no3_no2
            THEN 'non_conforme'
        WHEN
            split_nitrites_with_ref.valtraduite_no3 IS NULL
            OR (
                split_nitrites_with_ref.valtraduite_no2 IS NULL
                AND split_nitrites_with_ref.valtraduite_no3
                < split_nitrites_with_ref.limite_qualite_no3
            )
            THEN 'donnee_manquante'
        ELSE 'error'
    END AS resultat
FROM
    split_nitrites_with_ref
