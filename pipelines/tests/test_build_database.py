from click.testing import CliRunner

from pipelines.run import run_build_database


def test_build_database_last_year(tmp_path):
    runner = CliRunner()
    with runner.isolated_filesystem(temp_dir=tmp_path):
        result = runner.invoke(run_build_database, ["--refresh-type", "last"])

        # TODO: Add SQL check to verify that the last year was processed

        assert result.exit_code == 0
