import os

from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the .env file
dotenv_path = os.path.join(current_dir, ".env")


def load_env_variables():
    load_dotenv(dotenv_path)


def get_environment(default="prod"):
    env = os.getenv("ENV", default)
    if env not in ["dev", "prod"]:
        raise ValueError(f"Invalid environment: {env}. Must be 'dev' or 'prod'.")
    return env


def get_s3_path(env, filename="data.duckdb"):
    return f"{env}/database/{filename}"
