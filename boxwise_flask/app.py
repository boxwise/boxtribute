"""Configuration and instantiation of flask app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS

from boxwise_flask.routes import api_bp, frontend_bp


def create_app():
    # Not able to change the static folder variables after app is initialized
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(frontend_bp)
    app.register_blueprint(api_bp)
    return app
