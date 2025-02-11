import subprocess

import pytest


@pytest.mark.parametrize(
    "task", ["build_database", "download_database", "upload_database"]
)
def test_pipeline_task(task):
    """
    Test the specified pipeline task.

    This function tests the execution of the specified pipeline task from the
    pipelines/run.py script. It ensures that the task runs without raising any exceptions.

    Args:
        task (str): The name of the pipeline task to test.
    """
    commands_list = ["uv", "run", "pipelines/run.py", "run", task]

    # add options
    if task == "build_database":
        commands_list.extend(["--refresh-type", "last"])
    elif task in ("download_database", "upload_database"):
        commands_list.extend(["--env", "dev"])

    process = subprocess.run(commands_list)

    assert process.returncode == 0, f"{task} script failed"
