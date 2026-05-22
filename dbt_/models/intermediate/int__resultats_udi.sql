{{
  config(
    materialized='table'
  )
}}

WITH resultats AS (
    SELECT
        referenceprel,
        cdparametresiseeaux,
        cdparametre,
        referenceanl,
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
        r.limite_indicative,
        r.valeur_sanitaire_1,
        r.valeur_sanitaire_2
    FROM
        resultats
    INNER JOIN
        {{ ref("int__valeurs_de_reference") }} AS r
        ON
            resultats.cdparametresiseeaux = r.cdparametresiseeaux
)

-- Grain : (referenceprel, cdparametresiseeaux, referenceanl, de_partition, cdreseau)
-- Pas de jointure commune — pas de duplication par inseecommune.
SELECT
    resultats_with_ref.*,
    plv.cdreseau,
    plv.datetimeprel
FROM
    resultats_with_ref
INNER JOIN
    {{ ref("int__lien_cdreseau_refreneceprel") }} AS plv
    ON
        resultats_with_ref.referenceprel = plv.referenceprel
        AND
        resultats_with_ref.de_partition = plv.de_partition
