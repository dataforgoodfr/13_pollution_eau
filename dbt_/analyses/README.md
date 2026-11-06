# Analyses

Les fichiers SQL de ce dossier sont des analyses ad hoc (pas des modèles dbt).
Ils utilisent la syntaxe dbt (`{{ ref(...) }}`) mais ne sont pas matérialisés.

## Lancer une analyse

```bash
dbt show --select <nom_du_fichier_sans_extension>
```

Exemple :

```bash
dbt show --select udi_non_conformes_interdites_autorisees__sa_et_pertinents
```

`dbt show` compile le SQL (résout les `ref`) et l'exécute, puis affiche les résultats dans le terminal.
Par défaut, il limite à 5 lignes — utiliser `--limit N` pour en afficher plus.

## Prérequis

Les modèles référencés par l'analyse doivent être matérialisés dans la base :

```bash
dbt run --select +<nom_du_modele_ref>
```

## Exporter une analyse en CSV

`dbt compile` écrit le SQL compilé dans `target/`, qu'on exécute ensuite avec DuckDB :

```bash
cd dbt_
dbt compile --select parametres_non_references
duckdb ../database/data.duckdb --readonly \
  -c "COPY ($(cat target/compiled/dbt_/analyses/parametres_non_references.sql)) TO 'parametres_non_references.csv' (HEADER)"
```
