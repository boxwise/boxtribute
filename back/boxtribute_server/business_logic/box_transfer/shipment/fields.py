from datetime import datetime

from ariadne import ObjectType

from ....authz import authorize

shipment = ObjectType("Shipment")
shipment_detail = ObjectType("ShipmentDetail")


def first_letters_of_base_name(base):
    return base.name.upper()[:2]


@shipment.field("labelIdentifier")
async def resolve_shipment_label_identifier(shipment_obj, info):
    # Shipment ID left-padded with zeroes; three characters
    id_part = f"{shipment_obj.id:03}"[-3:]
    # Shipment start date in format YYMMDD
    date_part = datetime.strftime(shipment_obj.started_on.date(), "%y%m%d")
    source_base = await info.context["base_loader"].load(shipment_obj.source_base_id)
    target_base = await info.context["base_loader"].load(shipment_obj.target_base_id)
    # First letters of source and target base, concatenated by 'x'
    bases_part = (
        f"{first_letters_of_base_name(source_base)}x"
        + f"{first_letters_of_base_name(target_base)}"
    )
    # All three parts combined with hyphens; prefixed with 'S'
    # Example: S042-230815-THxLE
    return f"S{id_part}-{date_part}-{bases_part}"


@shipment.field("details")
def resolve_shipment_details(shipment_obj, info):
    return info.context["shipment_details_for_shipment_loader"].load(shipment_obj.id)


@shipment.field("transferAgreement")
def resolve_shipment_transfer_agreement(shipment_obj, info):
    return info.context["transfer_agreement_loader"].load(
        shipment_obj.transfer_agreement_id
    )


@shipment.field("sourceBase")
def resolve_shipment_source_base(shipment_obj, info):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return info.context["base_loader"].load(shipment_obj.source_base_id)


@shipment.field("targetBase")
def resolve_shipment_target_base(shipment_obj, info):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return info.context["base_loader"].load(shipment_obj.target_base_id)


@shipment.field("startedBy")
def resolve_shipment_started_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.started_by_id)


@shipment.field("sentBy")
def resolve_shipment_sent_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.sent_by_id)


@shipment.field("canceledBy")
def resolve_shipment_canceled_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.canceled_by_id)


@shipment.field("receivingStartedBy")
def resolve_shipment_receiving_started_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.receiving_started_by_id)


@shipment.field("completedBy")
def resolve_shipment_completed_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.completed_by_id)


@shipment_detail.field("sourceProduct")
def resolve_shipment_detail_source_product(detail_obj, info):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["product_loader"].load(detail_obj.source_product_id)


@shipment_detail.field("targetProduct")
def resolve_shipment_detail_target_product(detail_obj, info):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["product_loader"].load(detail_obj.target_product_id)


@shipment_detail.field("sourceLocation")
def resolve_shipment_detail_source_location(detail_obj, info):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["location_loader"].load(detail_obj.source_location_id)


@shipment_detail.field("targetLocation")
def resolve_shipment_detail_target_location(detail_obj, info):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["location_loader"].load(detail_obj.target_location_id)


@shipment_detail.field("box")
def resolve_shipment_detail_box(detail_obj, info):
    authorize(
        permission="stock:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["box_loader"].load(detail_obj.box_id)


@shipment_detail.field("autoMatchingPossible")
def resolve_shipment_detail_auto_matching_possible(detail_obj, info):
    return info.context["shipment_detail_auto_matching_loader"].load(detail_obj.id)


@shipment_detail.field("sourceSize")
def resolve_shipment_detail_source_size(detail_obj, info):
    return info.context["size_loader"].load(detail_obj.source_size_id)


@shipment_detail.field("targetSize")
def resolve_shipment_detail_target_size(detail_obj, info):
    return info.context["size_loader"].load(detail_obj.target_size_id)


@shipment_detail.field("shipment")
def resolve_shipment_detail_shipment(detail_obj, info):
    return info.context["shipment_loader"].load(detail_obj.shipment_id)


@shipment_detail.field("createdBy")
def resolve_shipment_detail_created_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.created_by_id)


@shipment_detail.field("removedBy")
def resolve_shipment_detail_removed_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.removed_by_id)


@shipment_detail.field("lostBy")
def resolve_shipment_detail_lost_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.lost_by_id)


@shipment_detail.field("receivedBy")
def resolve_shipment_detail_received_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.received_by_id)
