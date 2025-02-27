with edc_resultats as (select * from {{ref("stg_edc__resultats")}}),
edc_prelevements as (select * from {{ref("stg_edc__prevelevements")}}),
edc_communes as (select * from {{ref("stg_edc__communes")}}),
"resultats_cvm" as (
    select
      *,
      (CASE WHEN valtraduite > 0.5 THEN 1 ELSE 0 END) AS is_non_conforme
    from "edc_resultats"
    where cdparametresiseeaux = 'CLVYL'
),
"prelevements_cvm" as (
    select
        "cdreseau",
        "resultats_cvm"."de_partition",
        SUM(is_non_conforme) as "nbr_resultats_non_conformes",
        count(*) as "nbr_resultats_total"
    from "resultats_cvm"
    left join "edc_prelevements" on
        "edc_prelevements"."referenceprel" = "resultats_cvm"."referenceprel"
        and
        "edc_prelevements"."de_partition" = "resultats_cvm"."de_partition"
    group by "cdreseau", "resultats_cvm"."de_partition"
),
"communes_cvm" as (
    select
        "inseecommune",
        "edc_communes"."de_partition",
        coalesce(sum("nbr_resultats_non_conformes"), 0) as "nbr_resultats_non_conformes",
        coalesce(sum("nbr_resultats_total"), 0) as "nbr_resultats_total",
        case
            when sum("nbr_resultats_non_conformes") > 0 then 'non conforme'
            when sum("nbr_resultats_total") > 0 then 'conforme'
            else 'non analysé'
        end as "resultat"
    from "edc_communes"
    left join "prelevements_cvm" on
        "prelevements_cvm"."cdreseau" = "edc_communes"."cdreseau"
        and
        "prelevements_cvm"."de_partition" = "edc_communes"."de_partition"
    group by "inseecommune", "edc_communes"."de_partition"
),
"annees" as (SELECT unnest(generate_series(2020, 2024)) as "annee")
select
    "cog"."COM" as "commune_code_insee",
    "cog"."LIBELLE" as "commune_nom",
    a."annee",
    coalesce("resultat", 'non analysé') as "resultat_cvm"
from "cog_communes" as "cog"
cross join 
    "annees" a
left join "communes_cvm" on
   "cog"."COM" = "communes_cvm"."inseecommune"
   and
   a."annee"::string =  "communes_cvm"."de_partition"