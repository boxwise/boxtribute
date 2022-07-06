"""Main entry point for web application"""
import logging
import os

from .app import configure_app, create_app
from .routes import api_bp, app_bp

logger = logging.Logger("peewee")
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)

app = create_app()
blueprints = [api_bp] if os.getenv("EXPOSE_FULL_GRAPHQL") is None else [app_bp]
configure_app(
    app,
    *blueprints,
    host=os.environ["MYSQL_HOST"],
    port=int(os.environ["MYSQL_PORT"]),
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    database=os.environ["MYSQL_DB"],
    unix_socket=os.getenv("MYSQL_SOCKET"),
)

from .db import db
from .models.definitions.distribution_event import DistributionEvent
from .models.definitions.packing_list import PackingList
from .models.definitions.packing_list_entry import PackingListEntry

db.database.create_tables([DistributionEvent, PackingList, PackingListEntry])
