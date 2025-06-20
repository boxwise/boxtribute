"""Representation of user errors that possibly occur during usage of the back-end."""


class UserError:
    pass


class ResourceDoesNotExist(UserError):
    def __init__(self, *, name, id=None):
        self.id = id
        self.name = name


class InvalidPrice(UserError):
    def __init__(self, *, value):
        self.value = value


class InvalidDate(UserError):
    def __init__(self, *, date):
        self.date = date


class EmptyName(UserError):
    _ = None


class InsufficientPermission(UserError):
    def __init__(self, *, name):
        self.name = name


class UnauthorizedForBase(UserError):
    def __init__(self, *, id, base):
        self.id = id
        self.name = ""
        self.organisation_name = ""
        if base is not None:
            self.name = base.name
            self.organisation_name = base.organisation.name


class BoxesStillAssignedToProduct(UserError):
    def __init__(self, *, label_identifiers):
        self.label_identifiers = label_identifiers


class StandardProductAlreadyEnabledForBase(UserError):
    def __init__(self, *, product_id):
        self.existing_standard_product_instantiation_id = product_id


class OutdatedStandardProductVersion(UserError):
    def __init__(self, product_id):
        self.most_recent_standard_product_id = product_id


class ProductTypeMismatch(UserError):
    def __init__(self, *, expected_type):
        self.expected_type = expected_type


class TagTypeMismatch(UserError):
    def __init__(self, *, expected_type):
        self.expected_type = expected_type


class TagBaseMismatch(UserError):
    _ = None


class DeletedTag(UserError):
    def __init__(self, *, name):
        self.name = name


class DeletedLocation(UserError):
    def __init__(self, *, name):
        self.name = name


class DeletedBase(UserError):
    def __init__(self, *, name):
        self.name = name


class ExpiredLink(UserError):
    def __init__(self, *, valid_until):
        self.valid_until = valid_until


class UnknownLink(UserError):
    def __init__(self, *, code):
        self.code = code
