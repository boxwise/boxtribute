from boxtribute_server.enums import Language
from boxtribute_server.models.definitions.x_beneficiary_language import (
    XBeneficiaryLanguage,
)

from .beneficiary import default_beneficiary_data


def data():
    return [
        {"beneficiary": default_beneficiary_data()["id"], "language": Language.ar},
        {"beneficiary": default_beneficiary_data()["id"], "language": Language.en},
    ]


def create():
    XBeneficiaryLanguage.insert_many(data()).execute()
