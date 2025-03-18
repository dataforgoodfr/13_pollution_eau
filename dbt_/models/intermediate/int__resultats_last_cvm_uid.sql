WITH
list_communes_uid AS (
    SELECT DISTINCT cdreseau
    FROM
        {{ ref('int__lien_commune_cdreseau') }}
),

last_pvl AS (
    SELECT
        *,
        ROW_NUMBER()
            OVER (
                PARTITION BY cdreseau, cdparametresiseeaux
                ORDER BY datetimeprel DESC
            )
            AS row_number
    FROM
        {{ ref('int__resultats_udi_communes') }}
    WHERE
        categorie = 'cvm' -- à supprimer pour avoir pour tout
),

communes_last_pvl AS (
    SELECT last_pvl.* EXCLUDE (last_pvl.row_number)
    FROM
        last_pvl
    WHERE
        last_pvl.row_number = 1
),

resultat_communes_last_pvl AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        datetimeprel,
        CASE
            WHEN valtraduite = 0 THEN 'jamais quantifié'
            WHEN valtraduite = 1 THEN 'jamais quantifié'
            WHEN
                limitequal_float IS NOT NULL AND valtraduite > limitequal_float
                THEN '> 0,5 µg/L'
            WHEN
                limitequal_float IS NOT NULL AND valtraduite <= limitequal_float
                THEN '<= 0,5 µg/L'
            ELSE 'error check SQL'
        END AS resultat
    FROM
        communes_last_pvl
),

resultats_all_communes_last AS (
    SELECT
        list_communes_uid.cdreseau,
        'cvm' AS categorie,
        resultat_communes_last_pvl.cdparametresiseeaux,
        resultat_communes_last_pvl.datetimeprel AS last_datetimeprel,
        COALESCE(resultat_communes_last_pvl.resultat, 'Pas recherché')
            AS resultat
    FROM
        list_communes_uid
    LEFT JOIN
        resultat_communes_last_pvl
        ON
            list_communes_uid.cdreseau = resultat_communes_last_pvl.cdreseau
)

SELECT
    resultats_all_communes_last.*,
    'dernier prélévement' AS periode
FROM
    resultats_all_communes_last
