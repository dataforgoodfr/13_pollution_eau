from pathlib import Path


def get_project_root() -> Path:
    """
    Returns project root folder when called from anywhere in the project
    This is useful for specifying paths that are relative to the project root
    e.g. `local_db_path = Path(get_project_root(), "database/data.duckdb")`
    """
    return Path(__file__).parent.parent.parent
