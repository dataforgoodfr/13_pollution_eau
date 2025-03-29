SELECT
    cdparametresiseeaux::VARCHAR(10) AS cddept,
    cdparametre::INT AS cdparametre,
    libmajparametre::VARCHAR AS libmajparametre,
    libminparametre::VARCHAR AS libminparametre,
    casparam::VARCHAR AS casparam,
    categorie::VARCHAR AS categorie,
    souscat::VARCHAR AS souscat,
    detailsouscat::VARCHAR AS detailsouscat,
    limitequal::FLOAT AS limitequal,
    valsanitaire1::FLOAT AS valsanitaire1,
    commentvalsanitaire1::VARCHAR AS commentvalsanitaire1,
    valsanitaire2::FLOAT AS valsanitaire2,
    commentvalsanitaire2::VARCHAR AS commentvalsanitaire2,
    unite::VARCHAR AS unite,
    2025::SMALLINT AS de_partition,
    CURRENT_DATE AS de_ingestion_date
FROM {{ ref('mapping_categories_v2') }}
