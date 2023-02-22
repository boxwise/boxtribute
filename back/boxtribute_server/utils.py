import os


def in_development_environment() -> bool:
    return os.getenv("ENVIRONMENT") == "development"


def in_ci_environment() -> bool:
    return os.getenv("CI") == "true"


def convert_pascal_to_snake_case(word: str) -> str:
    return "".join(
        ["_" + char.lower() if char.isupper() else char for char in word]
    ).lstrip("_")
