"""Configuration and instantiation of flask app and peewee-managed database"""
import os

from flask import Flask
from flask_cors import CORS
from playhouse.flask_utils import FlaskDB

# Not able to change the static folder variables after app is initialized
app = Flask(
    __name__,
    static_folder=os.getenv("FLASK_STATIC_FOLDER", "static"),
    static_url_path=os.getenv("FLASK_STATIC_URL_PATH", "/static"),
)

CORS(app)

db = FlaskDB()
