SELECT
    inseecommune::VARCHAR(5) as inseecommune, 
    nomcommune::VARCHAR as nomcommune, 
    quartier::VARCHAR as quartier, 
    cdreseau::VARCHAR(9) as cdreseau, 
    nomreseau::VARCHAR as nomreseau, 
    debutalim::VARCHAR as debutalim, 
    de_partition::SMALLINT as de_partition
FROM {{ source('edc', 'edc_communes') }}