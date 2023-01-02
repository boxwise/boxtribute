"""Construction of routes for web app and API"""
import asyncio
import os

from ariadne import graphql
from ariadne.constants import PLAYGROUND_HTML
from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin

from .auth import request_jwt, requires_auth
from .authz import check_beta_feature_access
from .exceptions import AuthenticationFailed, format_database_errors
from .graph_ql.schema import full_api_schema, query_api_schema
from .loaders import (
    ProductCategoryLoader,
    ProductLoader,
    SizeLoader,
    SizeRangeLoader,
    SizesForSizeRangeLoader,
    TagsForBoxLoader,
)
from .logging import API_CONTEXT, WEBAPP_CONTEXT, log_request_to_gcloud
from .utils import in_development_environment

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
def public():
    response = (
        "Hello from a public endpoint! You don't need to be authenticated to see this."
    )
    return jsonify(message=response)


@api_bp.route("/", methods=["GET"])
def query_api_playground():
    return PLAYGROUND_HTML, 200


@api_bp.route("/", methods=["POST"])
@requires_auth
def query_api_server():
    log_request_to_gcloud(context=API_CONTEXT)
    return execute_async(schema=query_api_schema, introspection=True)


@api_bp.route("/token", methods=["POST"])
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


# Due to a bug in the flask-cors package, the function decorated with cross_origin must
# be listed before any other function that has the same route
# see https://github.com/corydolphin/flask-cors/issues/280
@app_bp.route("/graphql", methods=["POST"])
@cross_origin(
    # Allow dev localhost ports, and boxtribute subdomains as origins
    origins=[
        "http://localhost:5005",
        "http://localhost:3000",
        "https://v2-staging.boxtribute.org",
        "https://v2-demo.boxtribute.org",
        "https://v2.boxtribute.org",
        "https://v2-staging-dot-dropapp-242214.ew.r.appspot.com",
        "https://v2-demo-dot-dropapp-242214.ew.r.appspot.com",
        "https://v2-production-dot-dropapp-242214.ew.r.appspot.com",
    ],
    methods=["POST"],
    allow_headers="*"
    if in_development_environment()
    else ["Content-Type", "Authorization"],
)
@requires_auth
def graphql_server():
    log_request_to_gcloud(context=WEBAPP_CONTEXT)

    if not check_beta_feature_access(request.get_json()["query"]):
        return {"error": "No permission to access beta feature"}, 401

    return execute_async(schema=full_api_schema)


@app_bp.route("/graphql", methods=["GET"])
def graphql_playgroud():
    # On GET request serve GraphQL Playground
    # You don't need to provide Playground if you don't want to
    # but keep on mind this will not prohibit clients from
    # exploring your API using desktop GraphQL Playground app.
    return PLAYGROUND_HTML, 200


def execute_async(*, schema, introspection=None):
    """Create coroutine and execute it with high-level `asyncio.run` which takes care of
    managing the asyncio event loop, finalizing asynchronous generators, and closing
    the threadpool.
    """

    async def run():
        # Create DataLoaders and persist them for the time of processing the request.
        # DataLoaders require an event loop which is set up by asyncio.run
        context = {
            "product_category_loader": ProductCategoryLoader(),
            "product_loader": ProductLoader(),
            "size_loader": SizeLoader(),
            "size_range_loader": SizeRangeLoader(),
            "sizes_for_size_range_loader": SizesForSizeRangeLoader(),
            "tags_for_box_loader": TagsForBoxLoader(),
        }

        # Execute the GraphQL request against schema, passing in context
        results = await graphql(
            schema,
            data=request.get_json(),
            context_value=context,
            debug=current_app.debug,
            introspection=current_app.debug if introspection is None else introspection,
            error_formatter=format_database_errors,
        )
        return results

    success, result = asyncio.run(run())

    status_code = 200 if success else 400
    return jsonify(result), status_code
