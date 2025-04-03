import logging


def setup_logger(
    level=logging.INFO,
    log_format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
):
    "config log"
    logging.basicConfig(level=level, format=log_format)


def get_logger(name):
    return logging.getLogger(name)
