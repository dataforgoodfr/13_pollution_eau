import importlib
import logging
import os

import click

# Importer et charger les variables d'environnement depuis config.py
from pipelines.config.config import get_environment, load_env_variables

load_env_variables()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@click.group()
def cli():
    pass


@cli.command()
def list():
    """List all available tasks."""
    tasks_dir = os.path.join(os.path.dirname(__file__), "tasks")

    for filename in sorted(os.listdir(tasks_dir)):
        if filename.endswith(".py") and not filename.startswith("_"):
            module_name = filename[:-3]
            module = importlib.import_module(f"tasks.{module_name}")

            doc = module.__doc__ or "No description"
            doc_lines = doc.strip().split("\n")
            while doc_lines and not doc_lines[0].strip():
                doc_lines.pop(0)
            while doc_lines and not doc_lines[-1].strip():
                doc_lines.pop()

            click.echo(f"\n{module_name}:")
            for line in doc_lines:
                click.echo(f"    {line}")


@cli.group()
def run():
    """Run tasks."""
    pass


@run.command("build_database")
@click.option(
    "--refresh-type",
    type=click.Choice(["all", "last", "custom"]),
    default="all",
    help="Type of refresh to perform",
)
@click.option(
    "--custom-years",
    type=str,
    help="Comma-separated list of years to process (for custom refresh type)",
)
@click.option(
    "--drop-tables",
    is_flag=True,
    show_default=True,
    default=False,
    help="Drop and re-create edc tables in the database before data insertion.",
)
def run_build_database(refresh_type, custom_years, drop_tables):
    """Run build_database task."""
    module = importlib.import_module("tasks.build_database")
    task_func = getattr(module, "execute")

    custom_years_list = None
    if custom_years:
        custom_years_list = [year.strip() for year in custom_years.split(",")]

    task_func(
        refresh_type=refresh_type,
        custom_years=custom_years_list,
        drop_tables=drop_tables,
    )


@run.command("download_database")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default=None,
    help="Environment to download from. It will override environment defined in .env",
)
def run_download_database(env):
    """Download database from S3."""
    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="prod")
    logger.info(f"Running on env {env}")
    module = importlib.import_module("tasks.download_database")
    task_func = getattr(module, "execute")
    task_func(env)


@run.command("download_database_https")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default=None,
    help="Environment to download from. It will override environment defined in .env",
)
def run_download_database_https(env):
    """Download database from S3 via HTTPS."""
    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="prod")
    logger.info(f"Running on env {env}")
    module = importlib.import_module("tasks.download_database_https")
    task_func = getattr(module, "execute")
    task_func(env)


@run.command("upload_database")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default=None,
    help="Environment to upload to. It will override environment defined in .env",
)
def run_upload_database(env):
    """Upload database to S3."""
    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="dev")
    logger.info(f"Running on env {env}")
    module = importlib.import_module("tasks.upload_database")
    task_func = getattr(module, "execute")
    task_func(env)


if __name__ == "__main__":
    cli()
