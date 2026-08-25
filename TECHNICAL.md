# Documentation Technique

Ce document contient toutes les informations techniques nécessaires pour développer et contribuer au projet.

## Stack Technique

Le projet utilise ces technologies :

- **Python** (avec uv pour la gestion des dépendances) : pour le traitement des données (pipelines et dbt)
- **DuckDB** : pour la base de données
- **Pmtiles** : pour la diffusion des tuiles cartographiques (contenant les données)
- **Next.js** (React) : pour le site web interactif

La structure du projet est la suivante :

- `pipelines/` : Consolidation et préparation des données
- `dbt_/` : Modèles de données et transformations
- `webapp/` : Site web Next.js interactif
- `database/` : Base de données DuckDB et fichiers de cache

## Installation

### 1. Data Pipelines (Python) et database (DuckDB)

Installer [uv](https://docs.astral.sh/uv/getting-started/installation/#installing-uv). Ce projet utilise uv pour la gestion des dépendances Python.

Lancez la commande suivante pour installer la version de Python adéquate, créer un environnement virtuel et installer les dépendances du projet :

```bash
uv sync
```

L'ensemble des données du projet est stocké dans une database DuckDB: `database/data.duckdb`. Vous pouvez le télécharger en utilisant la commande suivante :

```bash
uv run pipelines/run.py run download_database
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
# Ou, travailler avec la base de données existante :
# uv run pipelines/run.py run download_database

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
- **models/website/** : Modèles finaux requêtés par le site web. Données propres et schéma optimisé pour les visualisations.

## Configuration Scaleway (S3)

Pour accéder au stockage S3 hébergé sur Scaleway, créez un fichier `.env` dans le dossier `pipelines/config` :

```text
SCW_ACCESS_KEY={ACCESS_KEY}
SCW_SECRET_KEY={SECRET_KEY}
```

Les credentials sont disponibles via le coffre-fort vaultwarden (demander à un chef de projet sur Slack).

Vous trouverez un exemple avec le fichier [.env.example](pipelines/config/.env.example)

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

## Architecture technique du frontend

Cette section explique comment le site web Next.js reçoit et affiche les données de pollution de l'eau.

### Sources de données

Le frontend consomme les données de trois sources principales :

#### 1. Fichiers PMTiles (données cartographiques et résultats par zone)

Les fichiers PMTiles sont générés par le pipeline Python (commande `generate_pmtiles`) et stockés dans `webapp/public/pmtiles/` :

- `udi_data.pmtiles` : Données des réseaux d'eau (UDI)
- `commune_data.pmtiles` : Données des communes

**Contenu des PMTiles :**

- Géométries vectorielles de chaque zone (tracés des UDI/communes)
- Données de pollution pour chaque zone (résultats d'analyses, concentrations, dates, etc.)

**Utilisation dans le code :**

- **Affichage des popups** (`webapp/components/PollutionMapMarker.tsx`) : Lorsqu'un utilisateur clique sur une zone, le composant `PollutionMapMarker` récupère les données de la zone cliquée via la variable `selectedZoneData` et les utilise pour afficher les résultats de pollution dans une popup.
- **Coloration de la carte** (`webapp/lib/colorMapping.ts`) : La fonction `generateColorExpression()` génère des expressions MapLibre GL qui définissent la couleur de chaque zone en fonction de ses résultats de pollution.

#### 2. Configuration des polluants (fichier statique)

Le fichier `webapp/lib/polluants.ts` contient la configuration statique de toutes les catégories de polluants :

- Liste complète des polluants suivis (PFAS, pesticides, nitrates, CVM, perchlorate, etc.)
- Labels d'affichage en français
- Palettes de couleurs pour chaque seuil de pollution
- etc.

Cette configuration est utilisée partout dans le frontend pour l'affichage des résultats.

#### 3. Base de données DuckDB (données agrégées)

Le fichier `database/data.duckdb` (réduit en production via `trim_database_for_website`) est utilisé pour :

**Données du site web Next.js** (`webapp/app/lib/data.ts`) :

- `fetchPollutionStats()` : Statistiques globales affichées sur la page d'accueil (nombre d'UDI polluées, etc.)
- `fetchParameterValues()` : Valeurs de référence des paramètres (limites réglementaires, labels) depuis la table `int__valeurs_de_reference`

**Routes API** (`webapp/app/api/`) :
Ces routes exposent des données en JSON pour des usages externes au site.

### Flux de données

```
Pipeline Python (generate_pmtiles)
    ↓
PMTiles (udi_data.pmtiles, commune_data.pmtiles)
    ↓
MapLibre GL (carte interactive)
    ↓
PollutionMapMarker (affichage des résultats)
```

```
Base DuckDB (data.duckdb)
    ↓
Fonctions fetchPollutionStats / fetchParameterValues
    ↓
Page d'accueil + Composants frontend
```
