# Guide pour agents IA

Carte interactive de la qualité de l'eau du robinet en France (pesticides/métabolites, PFAS,
nitrates, CVM, perchlorate). Voir [README.md](README.md) (contexte projet) et
[TECHNICAL.md](TECHNICAL.md) (installation, commandes) pour plus de détails.

## Architecture

```
pipelines/  →  dbt_/  →  database/data.duckdb  →  webapp/ (Next.js)
```

- `pipelines/` (Python + uv) : télécharge les données source (data.gouv.fr, object storage) et les
  charge dans DuckDB. Génère aussi les PMTiles (tuiles cartographiques).
- `dbt_/` : modèles SQL qui transforment les données brutes en tables exploitables par le site
  (`staging` → `intermediate` → `website`).
- `database/data.duckdb` : toute la donnée du projet est dans cette base DuckDB unique.
- `webapp/` : site Next.js qui lit `data.duckdb` (stats, valeurs de référence) et les PMTiles
  (carte, résultats par zone).

## Interroger la base de données

La base DuckDB locale (`database/data.duckdb`) peut être interrogée directement en CLI pour explorer
les données ou vérifier une hypothèse :

```bash
duckdb database/data.duckdb --readonly -c "select count(distinct referenceprel) from stg_edc__resultats"
```

## Source de données

La donnée source principale est le jeu de données data.gouv.fr
[Résultats du contrôle sanitaire de l'eau distribuée, commune par commune](https://www.data.gouv.fr/datasets/resultats-du-controle-sanitaire-de-leau-distribuee-commune-par-commune).

Elle est composée de 3 fichiers, repris tels quels dans les modèles `staging` de dbt (préfixe
`stg_edc__`) :

- **UDI_COM** (`stg_edc__communes`) : lien commune (`inseecommune`) ↔ UDI (`cdreseau`).
- **PLV — prélèvements** (`stg_edc__prevelevements`) : un prélèvement d'eau (`referenceprel`),
  sa date, son réseau, sa conformité globale. Granularité : `referenceprel` + `cdreseau` +
  `de_partition` (pas `referenceprel` + `de_partition` seuls) — un prélèvement fait sur une
  installation amont (`cdreseauamont`) est dupliqué sur chaque UDI avale qu'elle alimente.
- **RESULT — résultats d'analyse** (`stg_edc__resultats`) : un résultat de mesure pour un
  paramètre donné (`cdparametresiseeaux`) sur un prélèvement (`referenceprel`). Granularité :
  `referenceprel` + `cdparametresiseeaux` + `referenceanl` + `de_partition`.

`de_partition` (= année de récupération) est ajouté par le pipeline d'ingestion, pas dans la
donnée source.

## Les deux dimensions clés

Tout le modèle de données s'organise autour de deux axes orthogonaux, visibles dans le nommage
des modèles `intermediate` (`int__resultats_<polluant>_<zone>_<periode>`) :

1. **La zone géographique** : soit **UDI** (Unité de Distribution d'eau — un réseau physique de
   canalisations où l'eau est homogène, code `cdreseau`), soit **commune** (code INSEE). Une UDI
   peut couvrir plusieurs communes et une commune peut être desservie par plusieurs UDI — le lien
   se fait via `int__lien_commune_cdreseau`.

2. **La période** : soit **dernier prélèvement** (`dernier_prel` — la situation actuelle, la
   dernière analyse connue par UDI/commune et par paramètre), soit **bilan annuel**
   (`bilan_annuel_YYYY` — taux de non-conformité sur l'année, calculé par UDI/commune, catégorie
   et année depuis 2020).

Ces deux dimensions se retrouvent multipliées pour chaque catégorie de polluant (pesticides et
sous-catégories, PFAS, nitrates, CVM, substances industrielles, métaux lourds...), d'où le grand
nombre de modèles `intermediate`. Les modèles `website/web__resultats_udi` et
`web__resultats_communes` unifient tout ça en une seule table large (une ligne par
zone × période × catégorie).

## Logique métier notable

- Les seuils réglementaires/sanitaires par paramètre (`limite_qualite`, `valeur_sanitaire_1`,
  catégorisation pesticide "pertinent" / "non pertinent"...) viennent du seed
  `dbt_/seeds/references_generations_futures.csv`.
- Certains paramètres ont changé de catégorie "pertinent/non pertinent" au fil des années
  (ex. chlorothalonil R471811 en 2025, ESA métolachlore en 2023) : `int__resultats_udi` réécrit
  l'historique pour que chaque année soit jugée avec la classification en vigueur à l'époque (voir
  les commentaires dans ce modèle avant de les modifier).
- `valtraduite` (valeur numérique) est parfois corrompue dans la donnée source (ex. "OUI",
  "PRESENCE" traduits en 1) : corrigé en 0 dans `int__resultats_udi`.

## Convention SQL

Modèles dbt en 3 couches (`staging` → `intermediate` → `website`), formatage géré par sqlfluff
(`.sqlfluff`). Toujours passer par `cd dbt_` avant les commandes `dbt`.
