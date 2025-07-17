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

-- Statistiques par catégorie pour dernier prélèvement - non conformes
stats_categories_non_conforme AS (
    SELECT
        NULL AS stat_texte,
        'dernier_prel_' || categorie || '_nombre_non_conforme' AS stat_nom,
        count(
            CASE
                WHEN
                    -- Détermine si le résultat est non-conforme selon la catégorie
                    (
                        categorie IN ('tous')
                        AND resultat IN ('sup_limite_qualite', 'sup_limite_sanitaire')
                    )
                    OR (
                        categorie = 'pfas'
                        AND resultat IN ('sup_valeur_sanitaire', 'somme_20pfas_sup_0_1')
                    )
                    OR (
                        categorie IN ('pesticide', 'sub_active')
                        AND resultat IN ('sup_limite_qualite', 'sup_valeur_sanitaire')
                    )
                    OR (
                        categorie LIKE 'metabolite%'
                        AND resultat IN ('sup_limite_qualite', 'sup_valeur_sanitaire')
                    )
                    OR (categorie = 'nitrate' AND resultat = 'sup_limite_qualite')
                    OR (categorie = 'cvm' AND resultat = 'sup_0_5')
                    OR (categorie = 'sub_indus_14dioxane' AND resultat = 'sup_valeur_sanitaire')
                    OR (
                        categorie = 'sub_indus_perchlorate'
                        AND resultat IN ('sup_valeur_sanitaire', 'sup_valeur_sanitaire_2')
                    )
                    OR (
                        categorie = 'arsenic'
                        AND resultat IN ('entre_10_et_13', 'limite_sanitaire')
                    )
                    OR (categorie = 'plomb' AND resultat = 'limite_sanitaire')
                    THEN 1
            END
        ) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode = 'dernier_prel'
        AND resultat IS NOT NULL
    GROUP BY categorie
),

-- Statistiques par catégorie pour dernier prélèvement - recherchées
stats_categories_recherche AS (
    SELECT
        NULL AS stat_texte,
        'dernier_prel_' || categorie || '_nombre_recherche' AS stat_nom,
        count(DISTINCT cdreseau) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode = 'dernier_prel'
        AND resultat IS NOT NULL
    GROUP BY categorie
),

-- Statistique spécifique pour PFAS - nombre d'UDI sup limite sanitaire
stats_pfas_sup_limite_sanitaire AS (
    SELECT
        NULL AS stat_texte,
        'dernier_prel_pfas_nombre_sup_limite_sanitaire' AS stat_nom,
        count(DISTINCT cdreseau) AS stat_chiffre
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode = 'dernier_prel'
        AND categorie = 'pfas'
        AND resultat = 'sup_valeur_sanitaire'
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
FROM stats_categories_non_conforme
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_categories_recherche
UNION ALL
SELECT
    stat_nom,
    stat_chiffre,
    stat_texte
FROM stats_pfas_sup_limite_sanitaire
