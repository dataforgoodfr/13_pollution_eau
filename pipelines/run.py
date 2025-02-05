import importlib
import logging
import os
import sys

import click

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


@cli.command()
@click.argument("task_name")
@click.option(
    "--refresh-type",
    type=click.Choice(["all", "last", "custom"]),
    default="all",
    help="Type of refresh to perform",
    hidden=True,
)
@click.option(
    "--custom-years",
    type=str,
    help="Comma-separated list of years to process (for custom refresh type)",
    hidden=True,
)
def run(task_name, refresh_type, custom_years):
    """Run a specified task."""
    try:
        module = importlib.import_module(f"tasks.{task_name}")
        task_func = getattr(module, "execute")
        logging.info(f"Starting task {task_name}...")

        # Parse custom years if provided
        custom_years_list = None
        if custom_years:
            custom_years_list = [year.strip() for year in custom_years.split(",")]

        # Call the task function with parameters
        task_func(refresh_type=refresh_type, custom_years=custom_years_list)

        logging.info(f"Task {task_name} completed.")
    except (ModuleNotFoundError, AttributeError):
        logging.error(f"Task {task_name} not found.")
        sys.exit(1)


if __name__ == "__main__":
    cli()
