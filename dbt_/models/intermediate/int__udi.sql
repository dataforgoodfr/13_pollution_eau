select
    cdreseau,
    string_agg(distinct inseecommune) as inseecommunes,
    string_agg(distinct quartiers) as quartiers,
    string_agg(distinct nomreseaux) as nomreseaux


from {{ ref('int__lien_commune_cdreseau') }}
group by cdreseau
