---
title: Welcome to Evidence
---

Cette page est un exemple de tableau de bord Evidence.

## Liste des communes

```sql communes
  SELECT * FROM "local_duckdb"."edc_communes"
```

<DataTable data={communes} />

## Analyse des prélèvements

Nombre de prélèvement par jour

```sql prelevements_par_jour
  SELECT dateprel, count(*) as nb_prelevements
  FROM "local_duckdb"."edc_prelevements"
  GROUP BY dateprel
```

<CalendarHeatmap 
    data={prelevements_par_jour}
    date=dateprel
    value=nb_prelevements
    title="Prelevements par jour"
/>

## Recherche des prélèvements par commune

<TextInput
    name=name_of_input
    title="Saisir le nom de la commune"
    placeholder="Nom de la commune"
/>

```sql prelevements_commune
  SELECT
    *
  FROM "local_duckdb"."edc_prelevements"
  WHERE LOWER(nomcommuneprinc) = LOWER('${inputs.name_of_input}')
```

<DataTable data={prelevements_commune} />
