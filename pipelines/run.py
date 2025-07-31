import importlib
import os

import click

# Importer et charger les variables d'environnement depuis config.py
from pipelines.config.config import get_environment, load_env_variables
from pipelines.utils.logger import get_logger

load_env_variables()

logger = get_logger(__name__)


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
    "--refresh-table",
    type=click.Choice(["all", "edc", "commune", "atlasante"]),
    default="all",
    help="choose type of table to refresh",
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
@click.option(
    "--check-update",
    is_flag=True,
    show_default=True,
    default=False,
    help="Apply refresh-type only on the years whose data has been modified from the source.",
)
def run_build_database(
    refresh_type, refresh_table, custom_years, drop_tables, check_update
):
    """Run build_database task."""
    module = importlib.import_module("tasks.build_database")
    task_func = getattr(module, "execute")

    custom_years_list = []
    if custom_years:
        custom_years_list = [year.strip() for year in custom_years.split(",")]

    task_func(
        refresh_type=refresh_type,
        refresh_table=refresh_table,
        custom_years=custom_years_list,
        drop_tables=drop_tables,
        check_update=check_update,
    )


@run.command("download_database")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default=None,
    help="Environment to download from. It will override environment defined in .env",
)
@click.option(
    "--use-boto3",
    is_flag=True,
    default=False,
    help="Download database via Boto3 (instead of HTTPS).",
)
def run_download_database(env, use_boto3):
    """Download database

    :param env: The environment to download from ("dev" or "prod").
    :param use_boto3: Whether to download via Boto3 instead of direct download via HTTPS. Default is False.
    :return: None
    """
    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="prod")
    logger.debug(f"Running on env {env}")
    logger.debug(f"Downloading database via Boto3: {use_boto3}")
    module = importlib.import_module("tasks.download_database")
    task_func = getattr(module, "execute")
    task_func(env, use_boto3)


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


@run.command("generate_pmtiles_legacy")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default="dev",
    help="Environment to upload to. It will override environment defined in .env",
)
def run_generate_pmtiles_legacy(env):
    """Generate and upload pmtiles files using legacy method."""
    env = get_environment(default=env)
    logger.info(f"Running on env {env}")

    module = importlib.import_module("tasks.generate_pmtiles_legacy")
    task_func = getattr(module, "execute")
    task_func(env)


@run.command("generate_pmtiles")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default="dev",
    help="Environment to upload to. It will override environment defined in .env",
)
@click.option(
    "--upload",
    is_flag=True,
    default=False,
    help="Upload PMTiles files to S3 after generation.",
)
def run_generate_pmtiles(env, upload):
    """Generate and optionally upload PMTiles files."""
    env = get_environment(default=env)
    logger.info(f"Running DuckDB PMTiles generation on env {env}")

    module = importlib.import_module("tasks.generate_pmtiles")
    task_func = getattr(module, "execute")
    task_func(env, upload)


@run.command("download_pmtiles")
@click.option(
    "--env",
    type=click.Choice(["dev", "prod"]),
    default=None,
    help="Environment to download from. It will override environment defined in .env",
)
@click.option(
    "--use-boto3",
    is_flag=True,
    default=False,
    help="Download PMtiles via Boto3 (instead of HTTPS).",
)
def run_download_pmtiles(env, use_boto3):
    """Download PMtiles file from S3.

    Args:
        env: The environment to download from ("dev" or "prod").
        use_boto3: Whether to download via Boto3 instead of HTTPS. Default is False.
    """
    if env is not None:
        os.environ["ENV"] = env
    env = get_environment(default="prod")
    logger.info(f"Running on env {env}")

    module = importlib.import_module("tasks.download_pmtiles")
    task_func = getattr(module, "execute")
    task_func(env, use_boto3)


@run.command("trim_database_for_website")
@click.option(
    "--output-file",
    type=click.Path(file_okay=True, dir_okay=False),
    default=None,
    help="Path to save the trimmed database",
)
@click.option(
    "--tables-list",
    type=str,
    default=None,
    help="Comma-separated list of tables to keep (overrides default list)",
)
def run_trim_database_for_website(output_file, tables_list):
    """Trim database for website use by keeping only necessary tables."""
    module = importlib.import_module("tasks.trim_database_for_website")
    task_func = getattr(module, "execute")
    task_func(output_file=output_file, tables_list=tables_list)


if __name__ == "__main__":
    cli()
