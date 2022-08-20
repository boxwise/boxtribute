"""Construction of routes for web app and API"""
import asyncio
import os

from ariadne import graphql, graphql_sync
from ariadne.constants import PLAYGROUND_HTML
from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin

from .auth import request_jwt, requires_auth
from .exceptions import AuthenticationFailed, format_database_errors
from .graph_ql.schema import full_api_schema, query_api_schema
from .loaders import ProductLoader, SizeLoader, TagsForBoxLoader

# Blueprint for query-only API. Deployed on the 'api*' subdomains
api_bp = Blueprint("api_bp", __name__)

# Blueprint for app GraphQL server. Deployed on v2-* subdomains
app_bp = Blueprint("app_bp", __name__)


@api_bp.errorhandler(AuthenticationFailed)
@app_bp.errorhandler(AuthenticationFailed)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@app_bp.route("/public", methods=["GET"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
def public():
    response = (
        "Hello from a public endpoint! You don't need to be authenticated to see this."
    )
    return jsonify(message=response)


@api_bp.route("/", methods=["GET"])
def query_api_playground():
    return PLAYGROUND_HTML, 200


@api_bp.route("/", methods=["POST"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
@requires_auth
def query_api_server():
    success, result = graphql_sync(
        query_api_schema,
        data=request.get_json(),
        context_value=request,
        introspection=current_app.debug,
        error_formatter=format_database_errors,
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code


@api_bp.route("/token", methods=["POST"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
def api_token():
    success, result = request_jwt(
        **request.get_json(),  # must contain username and password
        client_id=os.environ["AUTH0_CLIENT_ID"],
        client_secret=os.environ["AUTH0_CLIENT_SECRET"],
        audience=os.environ["AUTH0_AUDIENCE"],
        domain=os.environ["AUTH0_DOMAIN"],
    )
    status_code = 200 if success else 400
    return jsonify(result), status_code


@app_bp.route("/graphql", methods=["GET"])
def graphql_playgroud():
    # On GET request serve GraphQL Playground
    # You don't need to provide Playground if you don't want to
    # but keep on mind this will not prohibit clients from
    # exploring your API using desktop GraphQL Playground app.
    return PLAYGROUND_HTML, 200


@app_bp.route("/graphql", methods=["POST"])
@cross_origin(origin="localhost", headers=["Content-Type", "Authorization"])
@requires_auth
def graphql_server():
    # Start async event loop, required for DataLoader construction, cf.
    # https://github.com/graphql-python/graphql-core/issues/71#issuecomment-620106364
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # Create DataLoaders and persist them for the time of processing the request
    context = {
        "product_loader": ProductLoader(),
        "size_loader": SizeLoader(),
        "tags_for_box_loader": TagsForBoxLoader(),
    }

    success, result = loop.run_until_complete(
        graphql(
            full_api_schema,
            data=request.get_json(),
            context_value=context,
            debug=current_app.debug,
            introspection=current_app.debug,
            error_formatter=format_database_errors,
        )
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code
