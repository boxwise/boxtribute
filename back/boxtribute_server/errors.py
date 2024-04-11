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
    def __init__(self, *, id, name):
        self.id = id
        self.name = name
