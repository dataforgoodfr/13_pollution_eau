WITH
-- Dernière mise à jour
derniere_maj AS (
    SELECT
        'derniere_mise_a_jour' AS stat_nom,
        NULL AS stat_chiffre,
        max(date_dernier_prel)::VARCHAR AS stat_texte
    FROM {{ ref('web__resultats_udi') }}
    WHERE periode = 'dernier_prel'
),

-- Total UDIs
total_udis AS (
    SELECT
        'total_udis' AS stat_nom,
        NULL AS stat_texte,
        count(DISTINCT cdreseau) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE periode = 'dernier_prel'
),

-- Statistiques par catégorie pour dernier prélèvement
stats_dernier_prel AS (
    SELECT
        NULL AS stat_texte,
        'dernier_prel_' || categorie || '_' || coalesce(resultat, 'non_recherche')
            AS stat_nom,
        count(*) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode = 'dernier_prel'

    GROUP BY categorie, resultat

),

-- Statistiques par catégorie et année pour bilan annuel - ratios par intervalles
stats_bilan_annuel_ratio AS (
    SELECT
        NULL AS stat_texte,
        periode || '_' || categorie || '_ratio_'
        || CASE
            WHEN ratio = 0 THEN '0'
            WHEN ratio <= 0.25 THEN '0.25'
            WHEN ratio <= 0.5 THEN '0.5'
            WHEN ratio <= 0.75 THEN '0.75'
            WHEN ratio <= 1 THEN '1'
            ELSE 'erreur'
        END AS stat_nom,
        count(*) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode LIKE 'bilan_annuel_%'
        AND ratio IS NOT NULL
        AND (
            nb_sup_valeur_sanitaire IS NULL
            OR nb_sup_valeur_sanitaire = 0
        )
    GROUP BY
        periode,
        categorie,
        CASE
            WHEN ratio = 0 THEN '0'
            WHEN ratio <= 0.25 THEN '0.25'
            WHEN ratio <= 0.5 THEN '0.5'
            WHEN ratio <= 0.75 THEN '0.75'
            WHEN ratio <= 1 THEN '1'
            ELSE 'erreur'
        END
),

-- Statistiques par catégorie et année pour bilan annuel - non recherche (ratio null)
stats_bilan_annuel_non_recherche AS (
    SELECT
        NULL AS stat_texte,
        periode || '_' || categorie || '_non_recherche' AS stat_nom,
        count(*) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode LIKE 'bilan_annuel_%'
        AND ratio IS NULL
        AND (
            nb_sup_valeur_sanitaire IS NULL
            OR nb_sup_valeur_sanitaire = 0
        )
    GROUP BY periode, categorie
),

-- Statistiques par catégorie et année pour bilan annuel - dépassements valeur sanitaire
stats_bilan_annuel_sup_sanitaire AS (
    SELECT
        NULL AS stat_texte,
        periode || '_' || categorie || '_sup_valeur_sanitaire' AS stat_nom,
        count(CASE WHEN nb_sup_valeur_sanitaire > 0 THEN 1 END) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode LIKE 'bilan_annuel_%'
        AND nb_sup_valeur_sanitaire IS NOT NULL
    GROUP BY periode, categorie
)

-- Union de toutes les statistiques
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM derniere_maj
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM total_udis
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_dernier_prel
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_bilan_annuel_ratio
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_bilan_annuel_non_recherche
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_bilan_annuel_sup_sanitaire
