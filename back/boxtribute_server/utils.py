import os


def in_development_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "development"


def in_staging_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "staging"


def in_demo_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "demo"


def in_production_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "production"


def in_ci_environment() -> bool:
    return os.getenv("CI") == "true"


def convert_pascal_to_snake_case(word: str) -> str:
    return "".join(
        ["_" + char.lower() if char.isupper() else char for char in word]
    ).lstrip("_")


def activate_logging():  # pragma: no cover
    """Activate logging to inspect SQL generated by peewee.
    Insert call to this function before the code section that should be examined.
    Get the peewee logger instance and set DEBUG logging level. Have the logging output
    propagated accordingly depending on the execution context.
    """
    import logging
    import sys

    logger = logging.getLogger("peewee")
    logger.setLevel(logging.DEBUG)

    if "pytest" in sys.modules:
        # Code is being run in testing session.
        # Avoid adding multiple handlers (resulting in duplicated logging messages) if
        # the function is used more than once.
        # Only the original NullHandler has been added before (by peewee internally)
        if len(logger.handlers) == 1:
            logger.addHandler(logging.StreamHandler())
    else:
        # Code is being run as permanent Flask app (e.g. started as docker-compose
        # service)
        from flask import current_app

        logger.parent = current_app.logger
        handler = logging.FileHandler("back/peewee.log")
        formatter = logging.Formatter("%(created)f | %(message)s")
        handler.setFormatter(formatter)
        if len(logger.handlers) == 1:
            logger.addHandler(handler)
    return logger
