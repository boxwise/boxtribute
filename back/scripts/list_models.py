"""Iterate over all peewee models, and output their names and fields incl. the
corresponding MySQL table names and columns to file.
"""
import subprocess
import sys
from pathlib import Path

SCRIPT_DIRPATH = Path(__file__).resolve().parent
TEST_DATA_DIRPATH = SCRIPT_DIRPATH.parent / "test"
sys.path.insert(0, str(TEST_DATA_DIRPATH))
from data import MODELS  # type: ignore


def main():
    # Add git SHA of current HEAD for reference
    commit = (
        subprocess.run("git rev-parse --short HEAD".split(), capture_output=True)
        .stdout.decode()
        .strip()
    )
    output_filename = f"peewee_models-{commit}.txt"

    output_filepath = SCRIPT_DIRPATH / output_filename
    print(f"Writing to {output_filepath}...")

    with (output_filepath).open("w") as file:
        file.write(
            f"""List of Peewee models and corresponding MySQL tables
version: {commit}
MODEL (table)

"""
        )
        for model in MODELS:
            file.write(f"{model._meta.name:32} " f"({model._meta.table_name})\n")

            for field in model._meta.sorted_fields:
                file.write(f"  {field.name:30} ({field.column_name})\n")

            file.write("\n")


if __name__ == "__main__":
    main()
