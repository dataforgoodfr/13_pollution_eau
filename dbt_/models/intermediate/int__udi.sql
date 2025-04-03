select
    cdreseau,
    string_agg(distinct inseecommune) as inseecommunes,
    string_agg(distinct quartiers) as quartiers,
    string_agg(distinct nomreseaux) as nomreseaux


from {{ ref('int__lien_commune_cdreseau') }}
group by cdreseau

-- TODO: on pourrait garder une partition avec "de_partition".
-- A noter néanmoins que la seule dépendance à ce modèle (web__resultats_udi)
-- ne le requiert pas.
