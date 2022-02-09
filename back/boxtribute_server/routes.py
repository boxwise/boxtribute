"""Construction of routes for web app"""
import os

from ariadne import graphql_sync
from ariadne.constants import PLAYGROUND_HTML
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from .auth import requires_auth
from .exceptions import AuthenticationFailed, format_database_errors
from .graph_ql.schema import full_api_schema, query_api_schema

# Blueprint for API
api_bp = Blueprint(
    "api_bp",
    __name__,
    url_prefix=os.getenv("FLASK_URL_PREFIX", ""),
)


@api_bp.errorhandler(AuthenticationFailed)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@api_bp.route("/public", methods=["GET"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
def public():
    response = (
        "Hello from a public endpoint! You don't need to be authenticated to see this."
    )
    return jsonify(message=response)


@api_bp.route("/api", methods=["GET"])
def query_api_playground():
    return PLAYGROUND_HTML, 200


@api_bp.route("/api", methods=["POST"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
@requires_auth
def query_api_server():
    success, result = graphql_sync(
        query_api_schema,
        data=request.get_json(),
        context_value=request,
        introspection=os.getenv("FLASK_ENV") == "development",
        error_formatter=format_database_errors,
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code


@api_bp.route("/graphql", methods=["GET"])
def graphql_playgroud():
    # On GET request serve GraphQL Playground
    # You don't need to provide Playground if you don't want to
    # but keep on mind this will not prohibit clients from
    # exploring your API using desktop GraphQL Playground app.
    return PLAYGROUND_HTML, 200


@api_bp.route("/graphql", methods=["POST"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
@requires_auth
def graphql_server():
    # Note: Passing the request to the context is optional.
    # In Flask, the current request is always accessible as flask.request

    debug_graphql = bool(os.getenv("DEBUG_GRAPHQL", False))
    success, result = graphql_sync(
        full_api_schema,
        data=request.get_json(),
        context_value=request,
        debug=debug_graphql,
        introspection=os.getenv("FLASK_ENV") == "development",
        error_formatter=format_database_errors,
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code
