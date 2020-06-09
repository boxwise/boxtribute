"""Configuration and instantiation of flask app and peewee-managed database"""
import os

from flask import Flask
from flask_cors import CORS
from flask_peewee.db import Database

app = Flask(__name__)
CORS(app)

app.config["DATABASE"] = {
    "name": os.getenv("MYSQL_DB"),
    "engine": "peewee.MySQLDatabase",
    "user": os.getenv("MYSQL_USER"),
    "host": os.getenv("MYSQL_HOST"),
    "password": os.getenv("MYSQL_PASSWORD"),
    # int, otherwise: TypeError: %d format: a number is required, not str from
    # pymysql.connections
    "port": int(os.getenv("MYSQL_PORT", 0)),
}


db = Database(app).database
