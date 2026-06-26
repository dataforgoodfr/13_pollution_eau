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
),

-- Reclassements "pertinent → non_pertinent" intervenus au fil des années. Le seed
-- references_generations_futures porte l'état actuel (non_pertinent : limite_qualite
-- NULL, limite_indicative = 0.9 µg/L). Pour les années antérieures au reclassement,
-- on ré-écrit ici categorie_3 = 'pertinent', limite_qualite = 0.1 µg/L et
-- limite_indicative = NULL, afin que tous les modèles aval voient l'état historique.
--
-- Liste des reclassements :
-- - Chlorothalonil R471811 (471811R, R471811) : changement en 2025.
-- - ESA métolachlore (ESAMTC, MTCESA) : changement en 2023.
-- - Metolachlor NOA 413173 (MTCNOA, NOAMTC) : changement en 2023.
-- - OXA métolachlore (OXAMTC, MTCOXA) : changement en 2022.

resultats_with_overrides AS (
    SELECT
        * EXCLUDE (categorie_3, limite_qualite, limite_indicative),
        CASE
            WHEN
                cdparametresiseeaux IN ('471811R', 'R471811') AND de_partition < 2025
                THEN 'pertinent'
            WHEN
                cdparametresiseeaux IN ('ESAMTC', 'MTCESA') AND de_partition < 2023
                THEN 'pertinent'
            WHEN
                cdparametresiseeaux IN ('MTCNOA', 'NOAMTC') AND de_partition < 2023
                THEN 'pertinent'
            WHEN
                cdparametresiseeaux IN ('OXAMTC', 'MTCOXA') AND de_partition < 2022
                THEN 'pertinent'
            ELSE categorie_3
        END AS categorie_3,
        CASE
            WHEN cdparametresiseeaux IN ('471811R', 'R471811') AND de_partition < 2025 THEN 0.1
            WHEN cdparametresiseeaux IN ('ESAMTC', 'MTCESA') AND de_partition < 2023 THEN 0.1
            WHEN cdparametresiseeaux IN ('MTCNOA', 'NOAMTC') AND de_partition < 2023 THEN 0.1
            WHEN cdparametresiseeaux IN ('OXAMTC', 'MTCOXA') AND de_partition < 2022 THEN 0.1
            ELSE limite_qualite
        END AS limite_qualite,
        CASE
            WHEN cdparametresiseeaux IN ('471811R', 'R471811') AND de_partition < 2025 THEN NULL
            WHEN cdparametresiseeaux IN ('ESAMTC', 'MTCESA') AND de_partition < 2023 THEN NULL
            WHEN cdparametresiseeaux IN ('MTCNOA', 'NOAMTC') AND de_partition < 2023 THEN NULL
            WHEN cdparametresiseeaux IN ('OXAMTC', 'MTCOXA') AND de_partition < 2022 THEN NULL
            ELSE limite_indicative
        END AS limite_indicative
    FROM resultats_with_ref
),

expanded AS (
    SELECT
        resultats_with_overrides.*,
        udi.inseecommune,
        plv.datetimeprel
    FROM
        resultats_with_overrides
    INNER JOIN
        {{ ref("int__lien_cdreseau_refreneceprel") }} AS plv
        ON
            resultats_with_overrides.referenceprel = plv.referenceprel
            AND
            resultats_with_overrides.de_partition = plv.de_partition

    LEFT JOIN
        {{ ref("int__lien_commune_cdreseau") }} AS udi
        ON
            plv.cdreseau = udi.cdreseau
            AND plv.de_partition = udi.de_partition
)

-- Granularité : (referenceprel, cdparametresiseeaux, referenceanl, inseecommune)
-- Le SELECT DISTINCT écrase la dimension cdreseau : un prélèvement rattaché
-- à N UDIs partageant la même commune ne compte qu'une fois pour cette commune.
SELECT DISTINCT
    referenceprel,
    cdparametresiseeaux,
    cdparametre,
    referenceanl,
    de_partition,
    valtraduite,
    categorie,
    categorie_2,
    categorie_3,
    limite_qualite,
    limite_indicative,
    valeur_sanitaire_1,
    valeur_sanitaire_2,
    inseecommune,
    datetimeprel
FROM expanded
