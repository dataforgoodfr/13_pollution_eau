# Rendre Visible la Pollution de l'Eau Potable 💧

## Contexte du Projet

Ce projet, développé par des bénévoles de [Data For Good](https://www.dataforgood.fr/) lors de la saison 13, vise à créer une carte interactive pour [Générations Futures](https://www.generations-futures.fr/).

L'objectif est de consolider, analyser et cartographier les données sur la qualité de l'eau potable en France à partir de sources de données ouvertes.

## Structure du Projet

- `pipelines/` : Consolidation et préparation des données
- `analytics/` : Analyse des données
- `webapp/` : Développement du site web interactif

## Installation

### Data Pipelines

Installer [uv](https://docs.astral.sh/uv/getting-started/installation/#installing-uv). Ce projet utilise uv pour la gestion des dépendances Python.

  Installation sur Windows

  ```bash
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

  Installation sur Mac ou linux

  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

- Lancez la commande suivante pour installer la version de Python adéquate, créer un environnement virtuel et installer les dépendances du projet.

```bash
uv sync
```

#### VSCode

A l'usage, si vous utilisez VSCode, l'environnement virtuel sera automatiquement activé lorsque vous ouvrirez le projet. Sinon, il suffit de l'activer manuellement avec la commande suivante :

```bash
source .venv/bin/activate
```

Ou alors, utilisez la commande `uv run ...` (au lieu de `python ...`) pour lancer un script Python. Par exemple:

```bash
uv run pipelines/run.py run build_database
```

#### Pycharm

Allez dans settings, python interpreter, add interpreter, puis selectionnez existing venv et allez chercher le path du python executable dans .venv (.venv/Scripts/Python.exe pour windows)

#### Terminal

utilisez les commandes `uv run` pour lancer un script Python depuis votre terminal

### Site web

- Installez [Node.js](https://nodejs.org/) ou [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  nvm install 22
  ```

- Installez les dépendances du site web:

  ```bash
  cd webapp
  npm install
  ```

- Lancer `npm run dev` et ouvrir le navigateur sur http://localhost:3000 pour voir la carte.

## Data Processing

### Package installation

Tout le code dans pipelines sera installé en tant que package python automatiquement à chaque uv_sync

### Comment construire la database

Une fois l'environnement python setup avec uv, vous pouvez lancer data_pipeline/run.py pour remplir la database

Le téléchargement des données peut se faire de plusieurs manières :
1. Téléchargement des données de la dernière année (par défaut)
```bash
uv run pipelines/run.py run build_database --refresh-type last
```

2. Téléchargement de toutes les données

```bash
uv run pipelines/run.py run build_database --refresh-type all
```

3. Téléchargement de données d'années spécifiques
```bash
uv run pipelines/run.py run build_database --refresh-type custom --custom-years 2018,2024,...
```

4. Suppression des tables, puis téléchargement des données de la dernière année
```bash
uv run pipelines/run.py run build_database --refresh-type last --drop-tables
```

### Création du modèles de données avec dbt
#### 1. Commandes a exécuter
La librarie dbt est celle choisie pour une construction rapide et simple de modèles de données optimisé pour l'analytics.

🚩**Remarque** : Pour lancer chaque commande individuellement, veillez à bien vous placer dans le dossier dbt_ (`cd dbt_`) avant de lancer les commandes.

La commande `uv run dbt deps` permet de télécharger les dépendances du projet dbt.
Exécutée lors de la création de la base de données, la commande `uv run dbt build` est une commande qui permet de réaliser l'ensemble des actions suivantes :
* Lancer la création des tables issues des données brutes (`uv run dbt run`)
* Réaliser les test de qualité des données (`uv run dbt test`)
* Mettre sous forme de table les fichiers csv ajoutés dans le dossiers seeds (`uv run dbt seed`)

Une autre commande `uv run dbt docs generate` permet de générer la documentation des modèles de données renseignée dans les fichiers `_xxx__models.yml` au format html. L'utilisation de la commande `uv run dbt docs serve` permet de lancer un serveur local pour visualiser la documentation.

Pour plus d'informations concernant la manière d'organiser un projet dbt, se référer à la [documentation officielle](https://docs.getdbt.com/docs/introduction) et notamment à la section .

#### 2. Structure des données

Les modèles de données sont organisés dans le dossier `dbt_/models`. La structure suit les recommandations de la [documentation officielle](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview). Il est conseillé prendre le temps la lire afin de bien comprendre la structure du projet:

* **models/staging/** : Modèles de données avec des transformation basiques (TRIM, REPLACE, typage, ...). Cette couche est surtout utilisée pour faire un état des données existantes, les documenter et tester la qualité.
* **models/intermediate/** : Modèles de données avec des transformation plus complexes (GROUP BY, JOIN, WHERE, ...). Cette couche est surtout utile pour faire une jointure entre les différentes tables et faire un premier filtrage des données. Celle-ci est très utile pour de l'analyse de données
* **models/analytics/** : Modèles de données final, qui est requêter par le site web pour construire les visualisations. Cette donnée est propre et la schématisation des données est optimisée pour le chargement des visualisations.

#### Documentation
La documentation du projet dbt est disponible sur le lien suivant: [documentation dbt](https://dataforgood.fr/13_pollution_eau/#!/overview)

### Comment télécharger la base de données

#### Via HTTPS

Vous pouvez simplement télécharger la base de données en cliquant sur le lien de téléchargement suivant:  https://pollution-eau-s3.s3.fr-par.scw.cloud/prod/database/data.duckdb

Vous pouvez également lancer la commande suivante :
```bash
uv run pipelines/run.py run download_database
```
Elle téléchargera la base, et la placera à l'emplacement utilisé par tout le monde (à savoir, `database/data.duckdb`). Un raccourci pour cette commande est accessible en un clic dans la barre des tâches de VS Code (ligne tout en bas) : "Download Dabatase".

### Depuis Scaleway via [boto3](https://github.com/boto/boto3) pour stockage objet S3

Des versions de développement et de production de la base de données sont à disposition sur le stockage object.

Un module a été créé dans [storage_client.py](pipelines%2Futils%2Fstorage_client.py) pour faciliter la connection au S3 hébergé sur Scaleway. Il faut bien configurer ses *credentials* Scaleway et son environnement. Pour cela, il faut créer un fichier `.env` dans le dossier [pipelines/config](pipelines%2Fconfig), avec les secrets ci-dessous dedans pour que la connexion fonctionne :

```text
SCW_ACCESS_KEY={ACCESS_KEY}
SCW_SECRET_KEY={SECRET_KEY}
```
où `{ACCESS_KEY}` et `{SECRET_KEY}` sont les *credentials* obtenus via le coffre-fort vaultwarden mis en place (pour cela, il suffit de demander à un chef de projet sur Slack).

Vous trouverez un exemple avec le fichier [.env.example](pipelines%2Fconfig%2F.env.example)

> ⚠ **Attention:** Ne jamais faire de *commit* des *access key* et *secret key*.

Une fois les credentials obtenus et mis dans le fichier `pipelines/config/.env`, vous pouvez alors lancer la commande suivante :

```bash
uv run pipelines/run.py run download_database --use-boto3
```
Vous pouvez également spécifier l'option `--env {dev|prod}`.

Le notebook [test_storage_utils.ipynb](pipelines%2Fnotebooks%2Ftest_storage_utils.ipynb) montre un exemple d'utilisation de l'utils pour charger et lire des csv sur le bucket S3 du projet.

### Data analysis

Les analyses se font via jupyter notebook

```bash
uv run jupyter notebook
```

## Tests

Pour lancer les tests, il suffit de lancer la commande suivante à la racine du projet:

```bash
uv run pytest -s
```

L'option `-s` permet d'afficher les prints dans le terminal.

## Pre Commit

Lancer la commande suivante pour s'assurer que le code satisfait bien tous les pre commit avant de créer votre pull request

```bash
pre-commit run --all-files
```

## Déploiement du site avec Docker

Un fichier `Dockerfile` est disponible pour déployer le site web avec Docker.

Pour créer et exécuter l'image Docker en local (à la racine du projet) :

```bash
docker build -t pollution-eau-app .

docker run -p 8080:8080 --rm pollution-eau-app
```

Le site sera alors accessible à l'adresse http://localhost:8080.

## How to contribute
Pour contribuer, il est recommandé d'utiliser un fork du projet. Cela permet d'éviter la gestion des demandes d'accès au dépôt principal.

* Dans un premier temps, cliquez sur Fork pour récupérer le projet dans votre espace GitHub.
* Créez votre branche de travail à partir de la branche main, en respectant la nomenclature suivante :
  * feature/nom_de_la_feature pour une nouvelle fonctionnalité
  * hotfix/nom_du_hotfix pour une correction rapide
* Poussez votre code vers votre dépôt distant.
* Créez une pull request en spécifiant :
  * Base repository : dataforgood/13_pollution_eau/main
  * Head repository : YourGithubAccount/13_pollution_eau/your_branch
* Pour faciliter la revue de la pull request :
  * Liez la pull request à un ticket NocoDB en ajoutant le lien du ticket dans la description.
  * Rédigez une description détaillée de la pull request afin de fournir un maximum d’informations sur les modifications apportées.
