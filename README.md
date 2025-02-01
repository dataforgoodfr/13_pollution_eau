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

- [Installation de Python](#installation-de-python)

Ce projet utilise [uv](https://docs.astral.sh/uv/) pour la gestion des dépendances Python. Il est préréquis pour l'installation de ce projet.

Installation sur Windows

```bash
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Installation sur Mac ou linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Une fois installé, il suffit de lancer la commande suivante pour installer la version de Python adéquate, créer un environnement virtuel et installer les dépendances du projet.

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

- [Installation de Node.js](#installation-de-nodejs) (pour le développement du site web et pour l'usage de Evidence)

Pour le développement du site web et pour l'usage de [Evidence](https://evidence.dev/), il est nécessaire d'installer Node.js. Pour cela, il suffit de suivre les instructions sur le [site officiel](https://nodejs.org/).

Pour installer les dépendances du site web, il suffit de lancer les commandes suivantes :

```bash
cd webapp
npm install
```

## Data Processing

### Package installation

Tout le code dans pipelines sera installé en tant que package python automatiquement à chaque uv_sync

### Comment construire la database

Une fois l'environnement python setup avec uv, vous pouvez lancer data_pipeline/run.py pour remplir la database
Il suffit de lancer

```bash
uv run pipelines/run.py run build_database
```

### Connection a Scaleway via boto3 pour stockage cloud

Un utils a été créé dans [storage_client.py](pipelines%2Futils%2Fstorage_client.py) pour faciliter la connection au S3 hébergé sur Scaleway.

Il faut créer un fichier .env dans le dossier pipelines/config avec les secrets ci dessous dedans pour que la connection fonctionne.

```text
SCW_ACCESS_KEY={ACCESS_KEY}
SCW_SECRET_KEY={SECRET_KEY}
```

Vous trouverez un example avec le fichier [.env.example](pipelines%2Fconfig%2F.env.example)

> ⚠ **Attention:** Ne jamais commir les access key et secret key.

Un vaultwarden va être setup pour récupérer les secrets pour les personnes qui en ont besoin

Le notebook [test_storage_utils.ipynb](pipelines%2Fnotebooks%2Ftest_storage_utils.ipynb) montre un example d'utilisation de l'utils pour charger et lire des csv sur le bucket S3 du projet

### Data analysis

Les analyses ce font via jupyter notebook

```bash
uv run jupyter notebook
```

## Pre Commit

Lancer la commande suivante pour s'assurer que le code satisfait bien tous les pre commit avant de créer votre pull request

```ba*sh
pre-commit run --all-files
```
