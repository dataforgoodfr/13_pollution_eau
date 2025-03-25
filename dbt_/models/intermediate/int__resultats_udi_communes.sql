WITH resultats AS (
    SELECT
        referenceprel,
        cdparametresiseeaux,
        limitequal,
        de_partition,

        -- Correction de la colonne valtraduite qui contient les valeurs
        -- textuelles de rqana converties en valeurs numériques.
        -- Certaines valeurs textuelles telles que "Changement anormal", "OUI",
        -- "PRESENCE" étaient converties en 1.
        -- Ces valeurs sont corrigées en 0 car on veut les considérer comme
        -- des valeurs non quantifiées.
        -- Les valeurs purement numériques restent inchangées.
        -- Exemples après correction :
        --   'Changement anormal' → 0
        --   'OUI' → 0
        --   'PRESENCE' → 0
        --   '1,0' → 1
        --   '>1' → 1
        CASE
            WHEN valtraduite = 1 AND REGEXP_MATCHES(rqana, '[a-zA-Z]') THEN 0
            ELSE valtraduite
        END AS valtraduite_corrigee,

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
        {{ ref("int__mapping_category_simple") }} AS mcs
        ON
            resultats.cdparametresiseeaux = mcs.cdparametresiseeaux
    WHERE
        mcs.categorie IN (
            'pesticides',
            'nitrite',
            'pfas',
            'cvm',
            'métaux lourds',
            'perchlorate',
            'hydrocarbures' -- contient le 1,4 dioxane
        )
)


SELECT
    resultats_with_cat.*,
    udi.cdreseau,
    udi.inseecommune,
    plv.datetimeprel
FROM
    resultats_with_cat
INNER JOIN
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
