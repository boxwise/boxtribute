from boxtribute_server.models.definitions.size import Size


def data():
    return {"id": 1, "label": "small"}


def create():
    Size.create(**data())
