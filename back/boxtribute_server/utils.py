import os


def in_development_environment():
    return os.getenv("ENVIRONMENT") == "development"


def in_ci_environment():
    return os.getenv("CI") == "true"
