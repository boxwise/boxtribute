import ariadne
import peewee


def format_database_errors(error, debug=False):
    """Custom formatting of peewee errors (indicating a missing resource) to avoid SQL
    queries from being exposed to the client.
    In the resulting response, the corresponding field for `data` will be None, and the
    `errors` list will have a single entry.
    """
    if debug:  # pragma: no cover
        return ariadne.format_error(error, debug)

    if isinstance(error.original_error, (peewee.DoesNotExist, peewee.IntegrityError)):
        # IntegrityError is raised when foreign key ID does not exist.
        error.message = ""  # setting `error.formatted["message"] = ""` has no effect
        error.extensions = {
            "code": "BAD_USER_INPUT",
            "description": "The requested resource does not exist in the database.",
        }
    elif isinstance(error.original_error, peewee.PeeweeException):
        error.message = ""
        error.extensions = {
            "code": "INTERNAL_SERVER_ERROR",
            "description": "The database failed to perform the requested action.",
        }
    return error.formatted


class AuthenticationFailed(Exception):
    """Custom exception for authentication errors on web API level (i.e. when
    hitting a Flask server endpoint).
    """

    def __init__(self, error, status_code=401):
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


class _InvalidResourceState(Exception):
    def __init__(self, resource_name, *args, expected_states, actual_state, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"The state of the {resource_name} ({actual_state.name}) "
            "does not allow the requested action. Expecting state: "
            f"{' or '.join(s.name for s in expected_states)}",
        }
        super().__init__(*args, **kwargs)


class InvalidTransferAgreementState(_InvalidResourceState):
    def __init__(self, *args, expected_states, actual_state, **kwargs):
        super().__init__(
            "transfer agreement",
            expected_states=expected_states,
            actual_state=actual_state,
            *args,
            **kwargs,
        )


class InvalidTransferAgreementOrganisation(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "The user's organisation is not permitted to execute the "
        "requested action.",
    }


class InvalidTransferAgreementBase(Exception):
    def __init__(self, *args, base_id, expected_base_ids, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"The specified base (ID: {base_id}) is not part of the "
            "current transfer agreement (included base IDs: "
            f"{', '.join(str(i) for i in expected_base_ids)}).",
        }
        super().__init__(*args, **kwargs)


class InvalidShipmentState(_InvalidResourceState):
    def __init__(self, *args, expected_states, actual_state, **kwargs):
        super().__init__(
            "shipment",
            expected_states=expected_states,
            actual_state=actual_state,
            *args,
            **kwargs,
        )


class InvalidPaginationInput(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid pagination input: missing 'before' field.",
    }
