SELECT
    inseecommune::VARCHAR(5) AS inseecommune,
    nomcommune::VARCHAR AS nomcommune,
    quartier::VARCHAR AS quartier,
    cdreseau::VARCHAR(9) AS cdreseau,
    nomreseau::VARCHAR AS nomreseau,
    debutalim::VARCHAR AS debutalim,
    de_partition::SMALLINT AS de_partition,
    de_ingestion_date::DATE AS de_ingestion_date,
    de_dataset_datetime::VARCHAR AS de_dataset_datetime
FROM {{ source('edc', 'edc_communes') }}
