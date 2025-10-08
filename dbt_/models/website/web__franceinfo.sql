WITH base_data AS (
    SELECT
        cdreseau,
        nomreseaux,
        categorie,
        nb_sup_valeur_sanitaire,
        COALESCE(nb_prelevements, 0) AS nb_prelevements,
        COALESCE(ROUND(ratio * nb_prelevements), 0) AS nb_depassements
    FROM {{ ref('web__resultats_udi') }}
    WHERE
        periode = 'bilan_annuel_2025'
        AND categorie IN ('pfas', 'pesticide', 'cvm', 'nitrate', 'sub_indus_perchlorate')
),

pivoted_data AS (
    SELECT
        cdreseau,
        nomreseaux,

        MAX(CASE WHEN categorie = 'pfas' THEN nb_prelevements END)
            AS pfas_nb,
        MAX(CASE WHEN categorie = 'pfas' THEN nb_depassements END)
            AS pfas_nb_depassements,
        MAX(CASE WHEN categorie = 'pfas' THEN nb_sup_valeur_sanitaire END)
            AS pfas_nb_sup_valeur_sanitaire,

        MAX(CASE WHEN categorie = 'pesticide' THEN nb_prelevements END)
            AS pesticide_nb,
        MAX(CASE WHEN categorie = 'pesticide' THEN nb_depassements END)
            AS pesticide_nb_depassements,
        MAX(CASE WHEN categorie = 'pesticide' THEN nb_sup_valeur_sanitaire END)
            AS pesticide_nb_sup_valeur_sanitaire,

        MAX(CASE WHEN categorie = 'cvm' THEN nb_prelevements END)
            AS cvm_nb,
        MAX(CASE WHEN categorie = 'cvm' THEN nb_depassements END)
            AS cvm_nb_depassements,

        MAX(CASE WHEN categorie = 'nitrate' THEN nb_prelevements END)
            AS nitrate_nb,
        MAX(CASE WHEN categorie = 'nitrate' THEN nb_depassements END)
            AS nitrate_nb_depassements,

        MAX(CASE WHEN categorie = 'sub_indus_perchlorate' THEN nb_prelevements END)
            AS sub_indus_perchlorate_nb,
        MAX(CASE WHEN categorie = 'sub_indus_perchlorate' THEN nb_depassements END)
            AS sub_indus_perchlorate_nb_depassements

    FROM base_data
    GROUP BY cdreseau, nomreseaux
)

SELECT
    cdreseau,
    JSON_OBJECT(
        'nomreseaux', nomreseaux,
        'pfas', JSON_OBJECT(
            'nb', pfas_nb,
            'nb_depassements', pfas_nb_depassements,
            'nb_sup_valeur_sanitaire', pfas_nb_sup_valeur_sanitaire
        ),
        'pesticide', JSON_OBJECT(
            'nb', pesticide_nb,
            'nb_depassements', pesticide_nb_depassements,
            'nb_sup_valeur_sanitaire', pesticide_nb_sup_valeur_sanitaire
        ),
        'cvm', JSON_OBJECT(
            'nb', cvm_nb,
            'nb_depassements', cvm_nb_depassements
        ),
        'nitrate', JSON_OBJECT(
            'nb', nitrate_nb,
            'nb_depassements', nitrate_nb_depassements
        ),
        'sub_indus_perchlorate', JSON_OBJECT(
            'nb', sub_indus_perchlorate_nb,
            'nb_depassements', sub_indus_perchlorate_nb_depassements
        )
    ) AS result
FROM pivoted_data
