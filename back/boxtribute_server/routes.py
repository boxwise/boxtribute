"""Construction of routes for web app and API"""

import os

from ariadne.explorer import ExplorerGraphiQL
from flask import jsonify, request
from flask_cors import cross_origin

from .auth import request_jwt, requires_auth
from .authz import check_beta_feature_access
from .blueprints import API_GRAPHQL_PATH, APP_GRAPHQL_PATH, CRON_PATH, api_bp, app_bp
from .exceptions import AuthenticationFailed
from .graph_ql.execution import execute_async
from .graph_ql.schema import full_api_schema, public_api_schema, query_api_schema
from .logging import API_CONTEXT, WEBAPP_CONTEXT, log_request_to_gcloud
from .utils import in_development_environment

# Allowed headers for CORS
CORS_HEADERS = ["Content-Type", "Authorization", "x-clacks-overhead"]

EXPLORER_TITLE = "boxtribute API"
EXPLORER_HTML = ExplorerGraphiQL(title=EXPLORER_TITLE).html(None)


@api_bp.errorhandler(AuthenticationFailed)
@app_bp.errorhandler(AuthenticationFailed)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@api_bp.get(API_GRAPHQL_PATH)
def query_api_explorer():
    return EXPLORER_HTML, 200


@api_bp.post(API_GRAPHQL_PATH)
@requires_auth
def query_api_server():
    log_request_to_gcloud(context=API_CONTEXT)
    return execute_async(schema=query_api_schema, introspection=True)


@api_bp.post("/public")
@cross_origin(
    # Allow dev localhost ports
    origins=[
        "http://localhost:5005",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    methods=["POST"],
    allow_headers="*" if in_development_environment() else CORS_HEADERS,
)
def public_api_server():
    # Block access unless in development
    if not in_development_environment():
        return {"error": "No permission to access public API"}, 401

    log_request_to_gcloud(context=API_CONTEXT)
    return execute_async(schema=public_api_schema, introspection=True)


@api_bp.post("/token")
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
@app_bp.post(APP_GRAPHQL_PATH)
@cross_origin(
    # Allow dev localhost ports, and boxtribute subdomains as origins
    origins=[
        "http://localhost:5005",
        "http://localhost:3000",
        "http://localhost:5173",
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


@app_bp.get(APP_GRAPHQL_PATH)
def graphql_explorer():
    return EXPLORER_HTML, 200


@api_bp.get("/public")
def public():
    return EXPLORER_HTML, 200


@app_bp.get(f"{CRON_PATH}/<job_name>")
def cron(job_name):
    authorized = False
    try:
        # https://cloud.google.com/appengine/docs/flexible/scheduling-jobs-with-cron-yaml#securing_urls_for_cron
        authorized = request.headers["X-Appengine-Cron"] == "true"
    except KeyError:
        pass
    if not authorized:
        from sentry_sdk import capture_message as emit_sentry_message

        emit_sentry_message(
            "Unauthorized user accessed /cron endpoint", level="warning"
        )
        return jsonify({"message": "unauthorized"}), 401

    permitted_databases = ["dropapp_dev", "dropapp_staging", "dropapp_demo"]
    if (db_name := os.environ["MYSQL_DB"]) not in permitted_databases:
        return jsonify({"message": f"Reset of '{db_name}' not permitted"}), 400

    if job_name == "reseed-db":
        from .cron.reseed_db import reseed_db

        # Any error will be reported as 500 response by Flask, and logged in Sentry
        reseed_db()
        return jsonify({"message": "reseed-db job executed"}), 200

    return jsonify({"message": f"unknown job '{job_name}'"}), 400
