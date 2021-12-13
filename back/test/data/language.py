from boxtribute_server.enums import Language as LanguageEnum
from boxtribute_server.models.definitions.language import Language


def data():
    return [{"code": lg.name, "id": lg.value, "rtl": 0} for lg in LanguageEnum]


def create():
    Language.insert_many(data()).execute()
