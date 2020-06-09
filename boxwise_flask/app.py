"""Configuration and instantiation of flask app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS
from flask_peewee.db import Database

app = Flask(__name__)
CORS(app)

db = Database(app, database="deferred")
