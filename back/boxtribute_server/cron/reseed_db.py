import os
import subprocess
from pathlib import Path

from flask import current_app

DATABASE_DUMP_FILEPATH = Path(__file__).parent.resolve().parent.parent / "init.sql"


def reseed_db():
    command = [
        "mysql",
        "-u",
        os.environ["MYSQL_USER"],
        f"-p{os.environ['MYSQL_PASSWORD']}",
        "-D",
        os.environ["MYSQL_DB"],
        "-S",
        os.environ["MYSQL_SOCKET"],
        # For testing locally on dev's machine with active docker-compose db service and
        #    dotenv run flask --debug --app boxtribute_server.dev_main:app run -p 5005
        # "-h", "127.0.0.1", "-P", "32000",
        "-e",
        f"source {DATABASE_DUMP_FILEPATH}",
    ]
    current_app.logger.info("Starting import")
    p = subprocess.run(command, capture_output=True)
    if p.returncode == 0:
        current_app.logger.info("Import completed")
    else:
        error_message = p.stderr.decode()
        current_app.logger.error(p.returncode)
        current_app.logger.error(error_message)
        return error_message
