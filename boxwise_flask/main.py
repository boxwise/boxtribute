"""Main entry point for application"""
import os

from .app import db
from .routes import app

# load data for database connection
db_user = os.getenv("MYSQL_USER")
db_password = os.getenv("MYSQL_PASSWORD")
db_name = os.getenv("MYSQL_DB")
db_host = os.getenv("MYSQL_HOST")
# int, otherwise: TypeError: %d format: a number is required, not str from
# pymysql.connections
db_port = int(os.getenv("MYSQL_PORT", 0))
gcloud_sql_connection_name = os.getenv("GCLOUD_SQL_CONNECTION_NAME", False)

if gcloud_sql_connection_name:
    app.config["DATABASE"] = "mysql://{}:{}@/{}?unix_socket=/cloudsql/{}".format(
        db_user, db_password, db_name, gcloud_sql_connection_name
    )
else:
    app.config["DATABASE"] = "mysql://{}:{}@{}:{}/{}".format(
        db_user, db_password, db_host, db_port, db_name
    )

db.init_app(app)
