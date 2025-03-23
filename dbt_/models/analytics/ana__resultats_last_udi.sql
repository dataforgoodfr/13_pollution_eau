WITH
int__resultats_last_uid AS (
    SELECT
        periode,
        cdreseau,
        categorie,
        last_datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_last_cvm_udi') }}
        /* UNION ALL
            Ajouter les autres substances */
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
        cat.categorie,
        com.cdreseau
    FROM
        int__lien_commune_cdreseau AS com
    CROSS JOIN
        cat
)

SELECT
    list_uid.cdreseau,
    list_uid.categorie,
    int__resultats_last_uid.periode,
    COALESCE(int__resultats_last_uid.resultat, 'Pas recherché depuis 2020')
        AS resultat
FROM
    list_uid
LEFT JOIN
    int__resultats_last_uid
    ON
        list_uid.categorie = int__resultats_last_uid.categorie
        AND list_uid.cdreseau = int__resultats_last_uid.cdreseau
