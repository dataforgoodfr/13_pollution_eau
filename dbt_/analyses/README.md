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
