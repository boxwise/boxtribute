from ariadne import ObjectType

from ....authz import authorize, authorized_bases_filter
from ....models.definitions.shipment import Shipment
from .crud import retrieve_transfer_agreement_bases

transfer_agreement = ObjectType("TransferAgreement")


@transfer_agreement.field("sourceBases")
def resolve_transfer_agreement_source_bases(transfer_agreement_obj, _):
    source_bases = retrieve_transfer_agreement_bases(
        agreement=transfer_agreement_obj, kind="source"
    )
    target_bases = retrieve_transfer_agreement_bases(
        agreement=transfer_agreement_obj, kind="target"
    )
    authorize(
        permission="base:read", base_ids=[b.id for b in source_bases + target_bases]
    )
    return source_bases


@transfer_agreement.field("targetBases")
def resolve_transfer_agreement_target_bases(transfer_agreement_obj, _):
    source_bases = retrieve_transfer_agreement_bases(
        agreement=transfer_agreement_obj, kind="source"
    )
    target_bases = retrieve_transfer_agreement_bases(
        agreement=transfer_agreement_obj, kind="target"
    )
    authorize(
        permission="base:read", base_ids=[b.id for b in source_bases + target_bases]
    )
    return target_bases


@transfer_agreement.field("shipments")
def resolve_transfer_agreement_shipments(transfer_agreement_obj, _):
    return Shipment.select().where(
        Shipment.transfer_agreement == transfer_agreement_obj.id,
        authorized_bases_filter(Shipment, base_fk_field_name="source_base")
        | authorized_bases_filter(Shipment, base_fk_field_name="target_base"),
    )
