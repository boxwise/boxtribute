"""
this is the "secret sauce" -- a single entry-point that resolves the
import dependencies.  If you're using blueprints, you can import your
blueprints here too.

then when you want to run your app, you point to main.py or `main.app`
"""
from .app import app, mysql

from .models import Camps
from .routes import *

def create_tables():
    # Create table for each model if it does not exist.
    # Use the underlying peewee database object instead of the
    # flask-peewee database wrapper:
    mysql.database.create_tables([Camps], safe=True)

if __name__ == '__main__':
    create_tables()
    app.run()