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


class BoxCreationFailed(Exception):
    extensions = {
        "code": "INTERNAL_SERVER_ERROR",
        "description": "The box could not be added to the database.",
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


class InvalidTransferAgreementState(Exception):
    def __init__(self, expected_states, actual_state, *args, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"The state of the transfer agreement ({actual_state.name}) "
            "does not allow the requested action. Expecting state: "
            f"{' or '.join(s.name for s in expected_states)}",
        }
        super().__init__(*args, **kwargs)


class InvalidTransferAgreementOrganisation(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "The user's organisation is not permitted to execute the "
        "requested action.",
    }


class InvalidPaginationInput(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid pagination input: missing 'before' field.",
    }
