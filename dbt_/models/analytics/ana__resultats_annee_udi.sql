WITH
int__resultats_annee_uid AS (
    SELECT
        cdreseau,
        categorie,
        resultat,
        annee,
        CONCAT(periode, ' - ', annee) AS periode
    FROM
        {{ ref('int__resultats_cvm_udi_annuel') }}
        /* UNION ALL
            Ajouter les autres substances */
),

annees AS (
    SELECT UNNEST(GENERATE_SERIES(2020, 2024)) AS annee
),

cat AS (
    SELECT DISTINCT categorie
    FROM
        {{ ref('int__mapping_category_simple') }}
    WHERE
        categorie NOT IN (
            'non classé', 'paramètre organoleptique'
        )
),


list_uid AS (
    SELECT DISTINCT
        annees.annee,
        cat.categorie,
        com.cdreseau
    FROM
        int__lien_commune_cdreseau AS com
    FULL OUTER JOIN
        annees
        ON
            com.de_partition = annees.annee
    CROSS JOIN
        cat
)

SELECT
    list_uid.cdreseau,
    list_uid.categorie,
    int__resultats_annee_uid.periode,
    COALESCE(int__resultats_annee_uid.resultat, 'Pas recherché') AS resultat
FROM
    list_uid
LEFT JOIN
    int__resultats_annee_uid
    ON
        list_uid.annee = int__resultats_annee_uid.annee
        AND list_uid.categorie = int__resultats_annee_uid.categorie
        AND list_uid.cdreseau = int__resultats_annee_uid.cdreseau
