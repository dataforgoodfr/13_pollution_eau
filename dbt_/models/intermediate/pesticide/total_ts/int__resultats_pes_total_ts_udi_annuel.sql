WITH
pesticide_prels AS (
    SELECT
        de_partition AS annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        cdparametresiseeaux,
        valtraduite,
        limite_qualite
    FROM
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pesticide'
        AND
        (
            categorie_2 = 'sub_active'
            OR categorie_2 = 'metabolite'
        )
        AND cdparametresiseeaux != 'PESTOT'
),

-- Somme de tous les pesticides (sub_active + tous métabolites) par prélèvement
prel_sum AS (
    SELECT
        annee,
        cdreseau,
        referenceprel,
        datetimeprel,
        SUM(COALESCE(valtraduite, 0)) AS total_pesticide_all
    FROM pesticide_prels
    GROUP BY annee, cdreseau, referenceprel, datetimeprel
)

SELECT
    cdreseau,
    annee,
    'pes_total_ts' AS categorie,
    'bilan_annuel_' || annee AS periode,
    COUNT(DISTINCT referenceprel) AS nb_prelevements,
    (
        COUNT(
            DISTINCT CASE WHEN total_pesticide_all > 0.5 THEN referenceprel END
        )::float
        / COUNT(DISTINCT referenceprel)::float
    ) AS ratio,
    TO_JSON({ 'TOTALPESTICIDEALL': MAX(total_pesticide_all) }) AS parametres_detectes,
    MAX(datetimeprel) AS date_dernier_prel

FROM prel_sum

GROUP BY cdreseau, annee
