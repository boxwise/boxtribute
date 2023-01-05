import os


def in_development_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "development"


def in_ci_environment() -> bool:
    return os.getenv("CI") == "true"
