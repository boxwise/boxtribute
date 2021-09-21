from pathlib import Path

from ariadne import load_schema_from_path

MODULE_DIRECTORY = Path(__file__).resolve().parent

type_defs = load_schema_from_path(MODULE_DIRECTORY / "types.gql")
