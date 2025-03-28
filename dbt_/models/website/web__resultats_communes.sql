-- ceci est un ancien modèle
-- TOOD: migrer vers un modèle similaire à web__resultats_udi.sql

with edc_resultats as (select * from {{ ref("stg_edc__resultats") }}),

edc_prelevements as (select * from {{ ref("stg_edc__prevelevements") }}),

edc_communes as (select * from {{ ref("stg_edc__communes") }}),

cog_communes as (select * from {{ ref("stg_communes__cog") }}),


resultats_cvm as (
    select
        *,
        (case when valtraduite > 0.5 then 1 else 0 end) as is_non_conforme
    from edc_resultats
    where cdparametresiseeaux = 'CLVYL'
),

prelevements_cvm as (
    select
        edc_prelevements.cdreseau,
        resultats_cvm.de_partition,
        SUM(resultats_cvm.is_non_conforme) as nbr_resultats_non_conformes,
        COUNT(*) as nbr_resultats_total
    from resultats_cvm
    left join edc_prelevements
        on
            resultats_cvm.referenceprel = edc_prelevements.referenceprel
            and
            resultats_cvm.de_partition = edc_prelevements.de_partition
    group by edc_prelevements.cdreseau, resultats_cvm.de_partition
),

communes_cvm as (
    select
        edc_communes.inseecommune,
        edc_communes.de_partition,
        COALESCE(SUM(prelevements_cvm.nbr_resultats_non_conformes), 0)
            as nbr_resultats_non_conformes,
        COALESCE(SUM(prelevements_cvm.nbr_resultats_total), 0)
            as nbr_resultats_total,
        case
            when
                SUM(prelevements_cvm.nbr_resultats_non_conformes) > 0
                then 'non conforme'
            when SUM(prelevements_cvm.nbr_resultats_total) > 0 then 'conforme'
            else 'non analysé'
        end as resultat
    from edc_communes
    left join prelevements_cvm
        on
            edc_communes.cdreseau = prelevements_cvm.cdreseau
            and
            edc_communes.de_partition = prelevements_cvm.de_partition
    group by edc_communes.inseecommune, edc_communes.de_partition
),

annees as (select UNNEST(GENERATE_SERIES(2020, 2024)) as annee)


select
    cog.com as commune_code_insee,
    cog.libelle as commune_nom,
    a.annee,
    COALESCE(communes_cvm.resultat, 'non analysé') as resultat_cvm
from cog_communes as cog
cross join
    annees as a
left join communes_cvm on
    cog.com = communes_cvm.inseecommune
    and
    a.annee::string = communes_cvm.de_partition
