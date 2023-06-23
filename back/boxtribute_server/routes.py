"""Construction of routes for web app and API"""
import os

from ariadne.explorer import ExplorerPlayground
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from .auth import request_jwt, requires_auth
from .authz import check_beta_feature_access
from .exceptions import AuthenticationFailed
from .graph_ql.execution import execute_async
from .graph_ql.schema import full_api_schema, query_api_schema
from .logging import API_CONTEXT, WEBAPP_CONTEXT, log_request_to_gcloud
from .utils import in_development_environment

# Blueprint for query-only API. Deployed on the 'api*' subdomains
api_bp = Blueprint("api_bp", __name__)

# Blueprint for app GraphQL server. Deployed on v2-* subdomains
app_bp = Blueprint("app_bp", __name__)

# Allowed headers for CORS
CORS_HEADERS = ["Content-Type", "Authorization", "x-clacks-overhead"]


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


PLAYGROUND_HTML = ExplorerPlayground(title="boxtribute API").html(None)


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
    allow_headers="*" if in_development_environment() else CORS_HEADERS,
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
