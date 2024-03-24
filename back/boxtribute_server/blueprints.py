from flask import Blueprint

# Blueprint for query-only API. Deployed on the 'api*' subdomains
api_bp = Blueprint("api_bp", __name__)

# Blueprint for app GraphQL server. Deployed on v2-* subdomains
app_bp = Blueprint("app_bp", __name__)

API_GRAPHQL_PATH = "/"
APP_GRAPHQL_PATH = "/graphql"
