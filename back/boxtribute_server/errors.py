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


class ProductTypeMismatch(UserError):
    def __init__(self, *, expected_type):
        self.expected_type = expected_type


class TagTypeMismatch(UserError):
    def __init__(self, *, expected_type):
        self.expected_type = expected_type


class DeletedTag(UserError):
    def __init__(self, *, name):
        self.name = name


class DeletedLocation(UserError):
    def __init__(self, *, name):
        self.name = name
