class AuthenticationFailed(Exception):
    """Custom exception for authentication errors on web API level (i.e. when
    hitting a Flask server endpoint).
    """

    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


# Custom exceptions to be raised in GraphQL resolver functions
# cf. https://github.com/mirumee/ariadne/issues/339#issuecomment-604380881
# Re-use error codes proposed by Apollo-Server
# cf. https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes
class UnknownResource(Exception):
    extensions = {
        "code": "INTERNAL_SERVER_ERROR",
        "description": "This resource is not known",
    }


class Forbidden(Exception):
    def __init__(self, resource, value, user, *args, **kwargs):
        self.extensions = {
            "code": "FORBIDDEN",
            "description": "You don't have access to the resource "
            f"{resource}={value}",
            "user": user,
        }
        super().__init__(*args, **kwargs)


class RequestedResourceNotFound(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "The requested resource does not exist in the database.",
    }
