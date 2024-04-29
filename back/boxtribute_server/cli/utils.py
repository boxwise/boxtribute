import logging


def setup_logger(name):
    logger = logging.getLogger(name)
    formatter = logging.Formatter("%(name)s | %(levelname)s | %(message)s")
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
