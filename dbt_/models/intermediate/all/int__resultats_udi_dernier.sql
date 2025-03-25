WITH
int__resultats_last_uid AS (
    SELECT
        periode,
        cdreseau,
        categorie,
        last_datetimeprel,
        resultat
    FROM
        {{ ref('int__resultats_cvm_udi_dernier') }}
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
    COALESCE(int__resultats_last_uid.periode, 'dernier prélévement') AS periode,
    COALESCE(int__resultats_last_uid.resultat, 'Pas recherché')
        AS resultat,
    COALESCE(int__resultats_last_uid.last_datetimeprel, 'Pas recherché')
        AS last_datetimeprel
FROM
    list_uid
LEFT JOIN
    int__resultats_last_uid
    ON
        list_uid.categorie = int__resultats_last_uid.categorie
        AND list_uid.cdreseau = int__resultats_last_uid.cdreseau
