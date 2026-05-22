-- Vérifie l'absence de double-comptage dans les agrégations UDI et commune.
--
-- Point de départ : le prélèvement '06000158209', NO3, 2025.
-- Dans stg_edc__resultats, c'est une unique ligne (1 seule analyse).
--
--   SELECT * FROM stg_edc__resultats
--   WHERE referenceprel = '06000158209' AND cdparametresiseeaux = 'NO3'
--   → 1 ligne, valtraduite = 50.2 mg/L (> seuil 50.0)
--
-- Ce prélèvement est rattaché à 2 UDIs et 4 communes via les jointures :
--   UDI 060000060 → communes 60060, 60088, 60218
--   UDI 060000805 → commune  60395
--
-- Ce test vérifie que le grain est respecté dans chaque modèle :
--   - int__resultats_udi      : 2 lignes (1 par UDI, pas de duplication par commune)
--   - int__resultats_communes : 4 lignes (1 par commune, pas de duplication par UDI)
--
-- Ce test doit retourner 0 ligne pour passer.

WITH prel_dans_source AS (
    SELECT count(*) AS nb_lignes
    FROM {{ ref('stg_edc__resultats') }}
    WHERE referenceprel = '06000158209' AND cdparametresiseeaux = 'NO3'
),

prel_dans_udi AS (
    SELECT
        count(*) AS nb_lignes,
        count(DISTINCT cdreseau) AS nb_udis
    FROM {{ ref('int__resultats_udi') }}
    WHERE referenceprel = '06000158209' AND cdparametresiseeaux = 'NO3'
),

prel_dans_communes AS (
    SELECT
        count(*) AS nb_lignes,
        count(DISTINCT inseecommune) AS nb_communes
    FROM {{ ref('int__resultats_communes') }}
    WHERE referenceprel = '06000158209' AND cdparametresiseeaux = 'NO3'
)

-- La source doit avoir exactement 1 ligne
SELECT 'stg_edc__resultats' AS modele, 'nb_lignes attendu = 1, obtenu = ' || nb_lignes AS message
FROM prel_dans_source
WHERE nb_lignes != 1

UNION ALL

-- int__resultats_udi : 2 lignes (1 par UDI, sans duplication par commune)
SELECT 'int__resultats_udi' AS modele, 'nb_lignes attendu = 2, obtenu = ' || nb_lignes AS message
FROM prel_dans_udi
WHERE nb_lignes != 2

UNION ALL

SELECT 'int__resultats_udi' AS modele, 'nb_udis attendu = 2, obtenu = ' || nb_udis AS message
FROM prel_dans_udi
WHERE nb_udis != 2

UNION ALL

-- int__resultats_communes : 4 lignes (1 par commune, sans duplication par UDI)
SELECT 'int__resultats_communes' AS modele, 'nb_lignes attendu = 4, obtenu = ' || nb_lignes AS message
FROM prel_dans_communes
WHERE nb_lignes != 4

UNION ALL

SELECT 'int__resultats_communes' AS modele, 'nb_communes attendu = 4, obtenu = ' || nb_communes AS message
FROM prel_dans_communes
WHERE nb_communes != 4
