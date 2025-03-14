WITH resultats AS (
    SELECT
        referenceprel,
        cdparametresiseeaux,
        valtraduite,
        limitequal,
        de_partition,
        CAST(
            REGEXP_EXTRACT(
                REPLACE(limitequal, ',', '.'), '-?\d+(\.\d+)?'
            ) AS FLOAT
        ) AS limitequal_float,
        REGEXP_EXTRACT(limitequal, '[a-zA-Zµg]+/?[a-zA-Z/L]+$') AS unite
    FROM
        {{ ref("stg_edc__resultats") }}
),

resultats_with_cat AS (
    SELECT
        resultats.*,
        mcs.categorie
    FROM
        resultats
    LEFT JOIN
        int__mapping_category_simple as mcs
        ON
            resultats.cdparametresiseeaux = mcs.cdparametresiseeaux
    WHERE
        mcs.categorie NOT IN (
            'non classé', 'paramètre organoleptique'
        )
)


SELECT
    resultats_with_cat.*,
    udi.inseecommune,
    plv.datetimeprel
FROM
    resultats_with_cat
LEFT JOIN
    {{ ref("int__lien_cdreseau_refreneceprel") }} AS plv
    ON
        resultats_with_cat.referenceprel = plv.referenceprel
        AND
        resultats_with_cat.de_partition = plv.de_partition

LEFT JOIN
    {{ ref("int__lien_commune_cdreseau") }} AS udi
    ON
        plv.cdreseau = udi.cdreseau
        AND plv.de_partition = udi.de_partition
