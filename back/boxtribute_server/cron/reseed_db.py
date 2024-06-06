from pathlib import Path

from ..db import db
from ..utils import in_staging_environment
from .data_faking import Generator

SEED_FILENAME = "init.sql" if in_staging_environment() else "minimal.sql"
SEED_FILEPATH = Path(__file__).parent.resolve().parent.parent / SEED_FILENAME


def reseed_db():
    # For testing locally, run
    # dotenv run flask --debug --app boxtribute_server.dev_main:app run -p 5005
    # curl 'http://localhost:5005/cron/reseed-db' -H 'x-appengine-cron: true'
    with db.database.cursor() as cursor, open(SEED_FILEPATH) as seed:
        execute_sql_statements_from_file(cursor, seed)

    if in_staging_environment():
        # Seed the staging DB with the large init.sql dump and skip running the
        # fake-data generation because the long runtime causes the connection to the
        # GCloud MySQL server to be interrupted
        return

    generator = Generator()
    generator.run()


def execute_sql_statements_from_file(cursor, sql_file):
    """Utility to parse a file with SQL statements and execute them one by one.

    Props to https://stackoverflow.com/a/19159041/3865876
    """
    statement = ""

    for line in sql_file.readlines():
        # ignore SQL comment lines (using string methods is way faster than regexes)
        if line.startswith("--"):
            continue

        line = line.strip()
        if not line.endswith(";"):
            # keep appending lines that don't end with semicolon
            statement = statement + line

        else:
            # when you get a line ending with semicolon, then execute statement and
            # reset for next statement
            statement = statement + line
            cursor.execute(statement)
            statement = ""
