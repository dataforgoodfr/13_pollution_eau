import importlib
import logging
import os
import sys

import click

# Importer et charger les variables d'environnement depuis config.py
from pipelines.config.config import load_env_variables

load_env_variables()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@click.group()
def cli():
    pass


@cli.command()
def list():
    """List all available tasks."""
    tasks_dir = os.path.join(os.path.dirname(__file__), "tasks")
    click.echo("Available tasks:")
    for filename in os.listdir(tasks_dir):
        if filename.endswith(".py") and not filename.startswith("_"):
            module_name = filename[:-3]
            module = importlib.import_module(f"tasks.{module_name}")
            description = module.__doc__ or "No description"
            description = description.strip().split("\n")[0]
            click.echo(f"- {module_name}: {description}")


@cli.command()
@click.argument("task_name")
def run(task_name):
    """Run a specified task."""
    try:
        module = importlib.import_module(f"tasks.{task_name}")
        task_func = getattr(module, "execute")
        logging.info(f"Starting task {task_name}...")
        task_func()
        logging.info(f"Task {task_name} completed.")
    except (ModuleNotFoundError, AttributeError):
        logging.error(f"Task {task_name} not found.")
        sys.exit(1)


if __name__ == "__main__":
    cli()
