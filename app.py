from ariadne import QueryType, graphql_sync, make_executable_schema
from ariadne.constants import PLAYGROUND_HTML
from flask import Flask, request, jsonify, _request_ctx_stack
from .resolvers import schema
import json
from flask_cors import cross_origin
from jose import jwt
from flask_mysqldb import MySQL
from dotenv import load_dotenv
import os
from .auth_helper import AuthError, requires_auth
from .db_helper import query

load_dotenv()

AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN')
API_AUDIENCE = os.getenv('AUTH0_AUDIENCE')
ALGORITHMS = ["RS256"]

APP = Flask(__name__)

APP.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
APP.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
APP.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
APP.config['MYSQL_DB'] = os.getenv('MYSQL_DB')
APP.config['MYSQL_PORT'] = os.getenv('MYSQL_PORT')

mysql = MySQL(APP)

@APP.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@APP.route("/api/somequery/")
def getcamps():
    sql = "Select * from camps"
    response = query(mysql, sql,())
    return jsonify(response)

@APP.route("/")
def HELLO():
    return "This is a landing page"
# This doesn't need authentication
@APP.route("/api/public")
@cross_origin(origin = "localhost",headers=["Content-Type", "Authorization"])
def public():
    response = "Hello from a public endpoint! You don't need to be authenticated to see this."
    return jsonify(message=response)

# This needs authentication
@APP.route("/api/private")
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
@requires_auth
def private():
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return jsonify(message=response)

@APP.route("/graphql", methods=["GET"])
def graphql_playgroud():
    # On GET request serve GraphQL Playground
    # You don't need to provide Playground if you don't want to
    # but keep on mind this will not prohibit clients from
    # exploring your API using desktop GraphQL Playground app.
    return PLAYGROUND_HTML, 200

@APP.route("/graphql", methods=["POST"])
def graphql_server():
    # GraphQL queries are always sent as POST
    data = request.get_json()

    # Note: Passing the request to the context is optional.
    # In Flask, the current request is always accessible as flask.request
    success, result = graphql_sync(
        schema,
        data,
        context_value=request,
        debug=APP.debug
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code


if __name__ == "__main__":
    APP.run(debug=True)