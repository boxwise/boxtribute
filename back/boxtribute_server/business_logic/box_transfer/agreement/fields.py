from ariadne import ObjectType

transfer_agreement = ObjectType("TransferAgreement")


@transfer_agreement.field("sourceOrganisation")
def resolve_agreement_source_organisation(transfer_agreement_obj, info):
    return info.context["organisation_loader"].load(
        transfer_agreement_obj.source_organisation_id
    )


@transfer_agreement.field("targetOrganisation")
def resolve_agreement_target_organisation(transfer_agreement_obj, info):
    return info.context["organisation_loader"].load(
        transfer_agreement_obj.target_organisation_id
    )


@transfer_agreement.field("sourceBases")
async def resolve_transfer_agreement_source_bases(
    transfer_agreement_obj, info, filter_input=None
):
    source_bases = await info.context["source_bases_for_agreement_loader"].load(
        transfer_agreement_obj.id
    )
    if filter_input is not None and filter_input.get("include_deleted") is True:
        return source_bases
    return [b for b in source_bases if b.deleted_on is None]


@transfer_agreement.field("targetBases")
async def resolve_transfer_agreement_target_bases(
    transfer_agreement_obj, info, filter_input=None
):
    target_bases = await info.context["target_bases_for_agreement_loader"].load(
        transfer_agreement_obj.id
    )
    if filter_input is not None and filter_input.get("include_deleted") is True:
        return target_bases
    return [b for b in target_bases if b.deleted_on is None]


@transfer_agreement.field("shipments")
def resolve_transfer_agreement_shipments(transfer_agreement_obj, info):
    return info.context["shipments_for_agreement_loader"].load(
        transfer_agreement_obj.id
    )


@transfer_agreement.field("requestedBy")
def resolve_shipment_requested_by(transfer_agreement_obj, info):
    return info.context["user_loader"].load(transfer_agreement_obj.requested_by_id)


@transfer_agreement.field("acceptedBy")
def resolve_shipment_accepted_by(transfer_agreement_obj, info):
    return info.context["user_loader"].load(transfer_agreement_obj.accepted_by_id)


@transfer_agreement.field("terminatedBy")
def resolve_shipment_terminated_by(transfer_agreement_obj, info):
    return info.context["user_loader"].load(transfer_agreement_obj.terminated_by_id)
