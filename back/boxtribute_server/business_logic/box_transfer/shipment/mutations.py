from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ....authz import authorize
from ....enums import TransferAgreementType
from ....models.definitions.shipment import Shipment
from ....models.definitions.transfer_agreement import TransferAgreement
from .crud import cancel_shipment, create_shipment, send_shipment, update_shipment

mutation = MutationType()


@mutation.field("createShipment")
@convert_kwargs_to_snake_case
def resolve_create_shipment(*_, creation_input):
    authorize(
        permission="shipment:create",
        base_ids=[creation_input["source_base_id"], creation_input["target_base_id"]],
    )
    agreement = TransferAgreement.get_by_id(creation_input["transfer_agreement_id"])
    organisation_ids = [agreement.source_organisation_id]
    if agreement.type == TransferAgreementType.Bidirectional:
        organisation_ids.append(agreement.target_organisation_id)
    authorize(organisation_ids=organisation_ids)
    return create_shipment(**creation_input, user=g.user)


@mutation.field("updateShipment")
@convert_kwargs_to_snake_case
def resolve_update_shipment(*_, update_input):
    shipment = Shipment.get_by_id(update_input["id"])
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )

    source_update_fields = [
        "prepared_box_label_identifiers",
        "removed_box_label_identifiers",
        "target_base_id",
    ]
    target_update_fields = [
        "received_shipment_detail_update_inputs",
        "lost_box_label_identifiers",
    ]
    organisation_id = None
    if any([update_input.get(f) is not None for f in source_update_fields]):
        # User must be member of organisation that created the shipment
        organisation_id = shipment.source_base.organisation_id
    elif any([update_input.get(f) is not None for f in target_update_fields]):
        # User must be member of organisation that is supposed to receive the shipment
        organisation_id = shipment.target_base.organisation_id

    if organisation_id is None:
        return shipment  # no update arguments provided
    authorize(organisation_id=organisation_id)

    return update_shipment(**update_input, user=g.user)


@mutation.field("cancelShipment")
def resolve_cancel_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    authorize(
        organisation_ids=[
            shipment.transfer_agreement.source_organisation_id,
            shipment.transfer_agreement.target_organisation_id,
        ]
    )
    return cancel_shipment(id=id, user=g.user)


@mutation.field("sendShipment")
def resolve_send_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    authorize(organisation_id=shipment.source_base.organisation_id)
    return send_shipment(id=id, user=g.user)
