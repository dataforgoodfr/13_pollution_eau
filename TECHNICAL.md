# Documentation Technique

Ce document contient toutes les informations techniques nécessaires pour développer et contribuer au projet.

## Stack Technique

Le projet utilise deux technologies principales :

- **Python** (avec uv pour la gestion des dépendances) : pour le traitement des données (pipelines et dbt)
- **Next.js** (React) : pour le site web interactif

## Prérequis

### Fichier de base de données

Le projet nécessite un fichier DuckDB (`database/data.duckdb`) qui contient toutes les données. Vous pouvez le télécharger via :

```bash
uv run pipelines/run.py run download_database
```

## Installation

### 1. Data Pipelines (Python)

Installer [uv](https://docs.astral.sh/uv/getting-started/installation/#installing-uv). Ce projet utilise uv pour la gestion des dépendances Python.

Lancez la commande suivante pour installer la version de Python adéquate, créer un environnement virtuel et installer les dépendances du projet :

```bash
uv sync
```

### 2. Site Web (Next.js)

Installez [Node.js](https://nodejs.org/) ou [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) :

Installez les dépendances du site web :

```bash
cd webapp
npm install
```

Lancez le serveur de développement :

```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000

## Commandes Principales

### Pipeline complet (comme en CI/CD)

Pour reconstruire complètement la base de données et générer les fichiers pour le site web :

```bash
# 1. Télécharger toutes les données sources
uv run pipelines/run.py run build_database --refresh-type all

# 2. Construire les modèles de données avec dbt
cd dbt_
uv run dbt build
cd ..

# 3. Générer les fichiers PMTiles pour la cartographie
uv run pipelines/run.py run generate_pmtiles

# 4. Déplacer les fichiers PMTiles pour le développement local
mv database/cache/commune_data.pmtiles webapp/public/pmtiles/commune_data.pmtiles
mv database/cache/udi_data.pmtiles webapp/public/pmtiles/udi_data.pmtiles

# 5. Lancer le site web en local
cd webapp && npm run dev
```

### Commandes utiles

Le script `pipelines/run.py` expose plusieurs commandes utiles :

#### Gestion de la base de données

```bash
# Télécharger la base de données depuis le cloud
uv run pipelines/run.py run download_database

# Télécharger la base de données depuis Scaleway via boto3 (nécessite credentials)
uv run pipelines/run.py run download_database --use-boto3

# Spécifier l'environnement (dev ou prod)
uv run pipelines/run.py run download_database --env prod
```

#### Construction de la base de données

```bash
# Téléchargement des données de la dernière année (par défaut)
uv run pipelines/run.py run build_database --refresh-type last

# Téléchargement de toutes les données
uv run pipelines/run.py run build_database --refresh-type all

# Téléchargement de données d'années spécifiques
uv run pipelines/run.py run build_database --refresh-type custom --custom-years 2018,2024

# Suppression des tables, puis téléchargement
uv run pipelines/run.py run build_database --refresh-type last --drop-tables

# Rafraîchir une table spécifique
uv run pipelines/run.py run build_database --refresh-table edc
```

#### Génération et gestion des PMTiles

```bash
# Générer les fichiers PMTiles (nécessite uv pip install .[pmtiles])
uv run pipelines/run.py run generate_pmtiles
```

#### Liste complète des commandes disponibles

Pour voir toutes les commandes disponibles :

```bash
uv run pipelines/run.py --help
```

Pour voir l'aide d'une commande spécifique :

```bash
uv run pipelines/run.py run build_database --help
```

## Modèles de données (dbt)

### Commandes dbt

🚩 **Remarque** : Pour lancer chaque commande individuellement, veillez à bien vous placer dans le dossier dbt\_ (`cd dbt_`) avant de lancer les commandes.

```bash
# Télécharger les dépendances dbt
uv run dbt deps

# Construire tous les modèles et exécuter les tests
uv run dbt build

# Créer uniquement les tables
uv run dbt run

# Exécuter uniquement les tests de qualité
uv run dbt test

# Charger les fichiers CSV du dossier seeds
uv run dbt seed

# Générer la documentation
uv run dbt docs generate

# Visualiser la documentation (serveur local)
uv run dbt docs serve
```

### Documentation des modèles de données

dbt génère automatiquement une documentation interactive de tous les modèles de données, incluant :

- La description de chaque table et colonne
- Les relations entre les tables
- Les tests de qualité appliqués
- Le lineage (graphe de dépendances) des données

Pour consulter cette documentation en local :

```bash
# 1. Se placer dans le dossier dbt_
cd dbt_

# 2. Générer la documentation
uv run dbt docs generate

# 3. Lancer le serveur local
uv run dbt docs serve
```

La documentation sera accessible sur http://localhost:8080

### Structure des données

Les modèles de données sont organisés dans le dossier `dbt_/models`. La structure suit les recommandations de la [documentation officielle dbt](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview) :

- **models/staging/** : Transformations basiques (TRIM, REPLACE, typage, ...). Cette couche documente et teste la qualité des données brutes.
- **models/intermediate/** : Transformations complexes (GROUP BY, JOIN, WHERE, ...). Utile pour joindre les tables et filtrer les données pour l'analyse.
- **models/analytics/** : Modèles finaux requêtés par le site web. Données propres et schéma optimisé pour les visualisations.

## Configuration Scaleway (S3)

Pour accéder au stockage S3 hébergé sur Scaleway, créez un fichier `.env` dans le dossier `pipelines/config` :

```text
SCW_ACCESS_KEY={ACCESS_KEY}
SCW_SECRET_KEY={SECRET_KEY}
```

Les credentials sont disponibles via le coffre-fort vaultwarden (demander à un chef de projet sur Slack).

Vous trouverez un exemple avec le fichier [.env.example](pipelines/config/.env.example)

## Analyse de données

Les analyses se font via Jupyter Notebook :

```bash
uv run jupyter notebook
```

## Tests

Pour lancer les tests à la racine du projet :

```bash
uv run pytest -s
```

L'option `-s` permet d'afficher les prints dans le terminal.

## Pre-commit

Assurez-vous que le code satisfait tous les pre-commit avant de créer votre pull request :

```bash
uv run pre-commit run --all-files
```

## Structure du projet

- `pipelines/` : Consolidation et préparation des données
- `dbt_/` : Modèles de données et transformations
- `analytics/` : Analyses et notebooks
- `webapp/` : Site web Next.js interactif
- `database/` : Base de données DuckDB et fichiers de cache
