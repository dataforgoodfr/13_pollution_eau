WITH resultats AS (
    SELECT
        referenceprel,
        cdparametresiseeaux,
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
        END AS valtraduite

        --  On n'utilise plus limitequal des données d'origine
        -- car on se base sur des valeurs fournies par Générations Futures
        --
        -- CAST(
        --     REGEXP_EXTRACT(
        --         REPLACE(limitequal, ',', '.'), '-?\d+(\.\d+)?'
        --     ) AS FLOAT
        -- ) AS limitequal_float,
        -- REGEXP_EXTRACT(limitequal, '[a-zA-Zµg]+/?[a-zA-Z/L]+$') AS unite
    FROM
        {{ ref("stg_edc__resultats") }}
),

resultats_with_ref AS (
    SELECT
        resultats.*,
        r.categorie_1 AS categorie,
        r.categorie_2,
        r.categorie_3,
        r.limite_qualite,
        r.valeur_sanitaire_1,
        r.valeur_sanitaire_2
    FROM
        resultats
    INNER JOIN
        {{ ref("references_generations_futures") }} AS r
        ON
            resultats.cdparametresiseeaux = r.cdparametresiseeaux
)


SELECT
    resultats_with_ref.*,
    udi.cdreseau,
    udi.inseecommune,
    plv.datetimeprel
FROM
    resultats_with_ref
INNER JOIN
    {{ ref("int__lien_cdreseau_refreneceprel") }} AS plv
    ON
        resultats_with_ref.referenceprel = plv.referenceprel
        AND
        resultats_with_ref.de_partition = plv.de_partition

LEFT JOIN
    {{ ref("int__lien_commune_cdreseau") }} AS udi
    ON
        plv.cdreseau = udi.cdreseau
        AND plv.de_partition = udi.de_partition
