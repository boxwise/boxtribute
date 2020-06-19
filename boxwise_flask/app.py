"""Configuration and instantiation of flask app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS
from playhouse.flask_utils import FlaskDB

app = Flask(__name__)
CORS(app)

db = FlaskDB()
