import peewee

from .utils import in_development_environment


def format_database_errors(error, debug=False):
    """Custom formatting of peewee errors (indicating a missing resource) to avoid SQL
    queries from being exposed to the client.
    In the resulting response, the corresponding field for `data` will be None, and the
    `errors` list will have a single entry.
    """
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

    if in_development_environment() and debug:  # pragma: no cover
        if not error.extensions:
            error.extensions = {}
        from flask import g

        error.extensions["user"] = g.user.__dict__ if hasattr(g, "user") else {}

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
class BoxCreationFailed(Exception):
    extensions = {
        "code": "INTERNAL_SERVER_ERROR",
        "description": "The box could not be added to the database.",
    }


class QrCodeAlreadyAssignedToBox(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "The QR code is already assigned to another box.",
    }


class Forbidden(Exception):
    def __init__(self, *args, permission=None, resource=None, value=None, **kwargs):
        if permission is not None and resource is not None and value is not None:
            raise ValueError(
                "Invalid input: set either 'permission', or 'resource'+'value'."
            )
        self.permission = permission
        self.resource = resource
        self.value = value
        reason = f"{resource}={value}" if permission is None else permission
        self.extensions = {
            "code": "FORBIDDEN",
            "description": f"You don't have access to '{reason}'",
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
            *args,
            expected_states=expected_states,
            actual_state=actual_state,
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


class InvalidTransferAgreementDates(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "'Valid until' date must be later than 'valid from' date.",
    }


class DuplicateTransferAgreement(Exception):
    def __init__(self, *args, agreement_id, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"An identical agreement already exists: ID {agreement_id}",
        }


class InvalidShipmentState(_InvalidResourceState):
    def __init__(self, *args, expected_states, actual_state, **kwargs):
        super().__init__(
            "shipment",
            *args,
            expected_states=expected_states,
            actual_state=actual_state,
            **kwargs,
        )


class InvalidShipmentDetailUpdateInput(Exception):
    def __init__(self, *args, model, detail, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"Input {model.__class__.__name__} is not valid for base of"
            f"shipment detail {detail.id}",
        }


class InvalidPaginationInput(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid pagination input: missing 'before' field.",
    }


class IncompatibleTagTypeAndResourceType(Exception):
    def __init__(self, *args, tag, resource_type, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"The tag with ID {tag.id} and type '{tag.type.name}' "
            f"cannot be applied to the resource of type '{resource_type.name}'",
        }
        super().__init__(*args, **kwargs)


class NegativeNumberOfItems(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid input: negative value for 'numberOfItems'",
    }


class NegativeMeasureValue(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid input: negative value for 'measureValue'",
    }


class IncompatibleSizeAndMeasureInput(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid input: either 'sizeId' or 'displayUnitId'+"
        "'measureValue' required",
    }


class DisplayUnitProductMismatch(Exception):
    extensions = {
        "code": "BAD_USER_INPUT",
        "description": "Invalid input: dimensions of 'displayUnit' and 'product' "
        "not matching",
    }


class InputFieldIsNotNone(Exception):
    def __init__(self, *args, field, **kwargs):
        self.extensions = {
            "code": "BAD_USER_INPUT",
            "description": f"Input field '{field}' must be None",
        }


class ServiceError(Exception):
    def __init__(self, *, code, message):
        self.code = code
        self.message = message
