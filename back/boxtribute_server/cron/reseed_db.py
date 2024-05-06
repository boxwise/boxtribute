from pathlib import Path

from ..db import db
from .data_faking import Generator

DATABASE_DUMP_FILEPATH = Path(__file__).parent.resolve().parent.parent / "init.sql"


def reseed_db():
    # For testing locally, run
    # dotenv run flask --debug --app boxtribute_server.dev_main:app run -p 5005
    # curl 'http://localhost:5005/cron/reseed-db' -H 'x-appengine-cron: true'
    with db.database.cursor() as cursor:
        with open(DATABASE_DUMP_FILEPATH) as seed:
            execute_sql_statements_from_file(cursor, seed)
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
