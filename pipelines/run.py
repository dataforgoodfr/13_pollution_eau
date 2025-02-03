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
