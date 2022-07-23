from boxtribute_server.models.definitions.base import Base
from boxtribute_server.models.definitions.beneficiary import Beneficiary
from boxtribute_server.models.definitions.box import Box
from boxtribute_server.models.definitions.distribution_event import DistributionEvent
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.definitions.log import Log
from boxtribute_server.models.definitions.qr_code import QrCode
from boxtribute_server.models.definitions.shipment import Shipment
from boxtribute_server.models.definitions.transaction import Transaction
from boxtribute_server.models.definitions.transfer_agreement import TransferAgreement
from boxtribute_server.models.definitions.user import User


def model_instance_dict(model, id):
    return model.select().where(model.id == id).dicts().get()


def test_models(
    default_base,
    default_beneficiary,
    default_box,
    default_history,
    default_log,
    default_qr_code,
    default_shipment,
    default_transaction,
    default_transfer_agreement,
    default_user,
    default_distribution_event,
):
    """Issue select-query for single model instance.
    Verify that result is a superset of the original test data (the test data might not
    contain optional fields).
    """
    base = model_instance_dict(Base, default_base["id"])
    assert base.items() >= default_base.items()

    beneficiary = model_instance_dict(Beneficiary, default_beneficiary["id"])
    assert beneficiary.items() >= default_beneficiary.items()

    box = model_instance_dict(Box, default_box["id"])
    assert box.items() >= default_box.items()

    history = model_instance_dict(DbChangeHistory, default_history["id"])
    assert history.items() >= default_history.items()

    log = model_instance_dict(Log, default_log["id"])
    assert log.items() >= default_log.items()

    qr_code = model_instance_dict(QrCode, default_qr_code["id"])
    assert qr_code.items() >= default_qr_code.items()

    shipment = model_instance_dict(Shipment, default_shipment["id"])
    assert shipment.items() >= default_shipment.items()

    transaction = model_instance_dict(Transaction, default_transaction["id"])
    assert transaction.items() >= default_transaction.items()

    transfer_agreement = model_instance_dict(
        TransferAgreement, default_transfer_agreement["id"]
    )
    assert transfer_agreement.items() >= default_transfer_agreement.items()

    distribution_event = model_instance_dict(
        DistributionEvent, default_distribution_event["id"]
    )
    assert distribution_event.items() >= default_distribution_event.items()

    user = model_instance_dict(User, default_user["id"])
    assert user.items() >= default_user.items()
