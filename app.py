from flask import Flask
from dotenv import load_dotenv
import os
# flask-peewee bindings
from flask_peewee.db import MySQLDatabase


load_dotenv()

AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
API_AUDIENCE = os.getenv('AUTH0_AUDIENCE')
ALGORITHMS = ["RS256"]

app = Flask(__name__)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')
app.config['MYSQL_PORT'] = os.getenv('MYSQL_PORT')

mysql =  MySQLDatabase(app)


def create_tables():
    Person.create_table()
    Camp.create_table()