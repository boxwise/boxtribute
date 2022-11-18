"""GraphQL resolver functionality"""
import os

from ariadne import MutationType, QueryType, convert_kwargs_to_snake_case
from boxtribute_server.exceptions import MobileDistroFeatureFlagNotAssignedToUser
from boxtribute_server.models.definitions.distribution_event_tracking_log_entry import (
    DistributionEventTrackingLogEntry,
)
from flask import g

from ..authz import (
    agreement_organisation_filter_condition,
    authorize,
    authorize_for_organisation_bases,
    authorized_bases_filter,
)
from ..box_transfer.agreement import (
    accept_transfer_agreement,
    cancel_transfer_agreement,
    create_transfer_agreement,
    reject_transfer_agreement,
    retrieve_transfer_agreement_bases,
)
from ..box_transfer.shipment import (
    cancel_shipment,
    create_shipment,
    send_shipment,
    update_shipment,
)
from ..enums import (
    DistributionEventState,
    LocationType,
    TaggableObjectType,
    TagType,
    TransferAgreementType,
)
from ..mobile_distribution.crud import (
    add_packing_list_entry_to_distribution_event,
    assign_box_to_distribution_event,
    change_distribution_event_state,
    complete_distribution_events_tracking_group,
    create_distribution_event,
    create_distribution_spot,
    delete_packing_list_entry,
    move_items_from_box_to_distribution_event,
    move_items_from_return_tracking_group_to_box,
    remove_all_packing_list_entries_from_distribution_event_for_product,
    set_products_for_packing_list,
    start_distribution_events_tracking_group,
    track_return_of_items_for_distribution_events_tracking_group,
    unassign_box_from_distribution_event,
    update_packing_list_entry,
)
from ..models.crud import (
    assign_tag,
    create_box,
    create_qr_code,
    create_tag,
    delete_tag,
    get_box_history,
    unassign_tag,
    update_box,
    update_tag,
)
from ..models.definitions.base import Base
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.definitions.distribution_event import DistributionEvent
from ..models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)
from ..models.definitions.location import Location
from ..models.definitions.organisation import Organisation
from ..models.definitions.packing_list_entry import PackingListEntry
from ..models.definitions.product import Product
from ..models.definitions.qr_code import QrCode
from ..models.definitions.shipment import Shipment
from ..models.definitions.shipment_detail import ShipmentDetail
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.definitions.unboxed_items_collection import UnboxedItemsCollection
from .bindables import (
    base,
    beneficiary,
    box,
    classic_location,
    distribution_event,
    distribution_events_tracking_group,
    distribution_spot,
    organisation,
    packing_list_entry,
    product,
    qr_code,
    shipment,
    shipment_detail,
    tag,
    transfer_agreement,
    unboxed_items_collection,
)
from .filtering import derive_beneficiary_filter, derive_box_filter
from .pagination import load_into_page

query = QueryType()
mutation = MutationType()


def mobile_distro_feature_flag_check(user_id):
    deployment_environment = os.getenv("ENVIRONMENT")
    if deployment_environment in ["development", "staging", "test"]:
        return

    allowed_user_ids_str = os.getenv("MOBILE_DISTRO_ALLOWED_USER_IDS")
    if allowed_user_ids_str is not None:
        allowed_user_ids_as_numbers = [int(i) for i in allowed_user_ids_str.split(",")]
        if user_id in allowed_user_ids_as_numbers:
            return

    if g.user.is_god:
        return

    raise MobileDistroFeatureFlagNotAssignedToUser(user_id)


@query.field("tag")
def resolve_tag(*_, id):
    tag = Tag.get_by_id(id)
    authorize(permission="tag:read", base_id=tag.base_id)
    return tag


@query.field("tags")
def resolve_tags(*_):
    return Tag.select().where(Tag.deleted.is_null() & authorized_bases_filter(Tag))


@query.field("packingListEntry")
def resolve_packing_list_entry(*_, id):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    entry = (
        PackingListEntry.select().join(Product).where(PackingListEntry.id == id).get()
    )
    authorize(permission="packing_list_entry:read", base_id=entry.product.base_id)
    return entry


@packing_list_entry.field("matchingPackedItemsCollections")
def resolve_packing_list_entry_matching_packed_items_collections(obj, *_):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="stock:read", base_id=obj.product.base_id)
    distribution_event_id = obj.distribution_event
    boxes = Box.select().where(
        Box.distribution_event == distribution_event_id,
        Box.product == obj.product,
        Box.size == obj.size,
    )
    unboxed_items_colletions = UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == distribution_event_id,
        UnboxedItemsCollection.product == obj.product,
        UnboxedItemsCollection.size == obj.size,
    )
    return list(boxes) + list(unboxed_items_colletions)


@query.field("bases")
def resolve_bases(*_):
    return Base.select().where(authorized_bases_filter())


@query.field("base")
def resolve_base(*_, id):
    authorize(permission="base:read", base_id=int(id))
    return Base.get_by_id(id)


@distribution_events_tracking_group.field("distributionEventsTrackingEntries")
def resolve_distribution_tracking_entries_for_tracking_group(
    distribution_events_tracking_group_obj, _
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(
        permission="distro_event:read",
        base_id=distribution_events_tracking_group_obj.base_id,
    )
    distribution_events = DistributionEventTrackingLogEntry.select().where(
        (
            DistributionEventTrackingLogEntry.distro_event_tracking_group_id
            == distribution_events_tracking_group_obj.id
        )
    )
    return distribution_events


@distribution_events_tracking_group.field("distributionEvents")
def resolve_distribution_events_for_distribution_events_tracking_group(
    distribution_events_tracking_group_obj, _
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(
        permission="distro_event:read",
        base_id=distribution_events_tracking_group_obj.base_id,
    )
    distribution_events = DistributionEvent.select().where(
        (
            DistributionEvent.distro_event_tracking_group_id
            == distribution_events_tracking_group_obj.id
        )
    )
    return distribution_events


@base.field("distributionEvents")
def resolve_distributions_events_for_base(base_obj, _, states=None):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="distro_event:read", base_id=base_obj.id)
    state_filter = DistributionEvent.state << states if states else True
    # simplify with test
    distribution_events = (
        DistributionEvent.select()
        .join(Location)
        .where(
            Location.base_id == base_obj.id,
            Location.type == LocationType.DistributionSpot,
            state_filter,
        )
    )
    return distribution_events


@query.field("qrExists")
@convert_kwargs_to_snake_case
def resolve_qr_exists(*_, qr_code):
    authorize(permission="qr:read")
    try:
        QrCode.get_id_from_code(qr_code)
    except QrCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
@box.field("qrCode")
@convert_kwargs_to_snake_case
def resolve_qr_code(obj, _, qr_code=None):
    authorize(permission="qr:read")
    return obj.qr_code if qr_code is None else QrCode.get(QrCode.code == qr_code)


@box.field("tags")
def resolve_box_tags(box_obj, info):
    return info.context["tags_for_box_loader"].load(box_obj.id)


@box.field("history")
def resolve_box_history(box_obj, _):
    authorize(permission="history:read")
    return get_box_history(box_obj.id)


@query.field("product")
def resolve_product(*_, id):
    product = Product.get_by_id(id)
    authorize(permission="product:read", base_id=product.base_id)
    return product


@box.field("product")
@unboxed_items_collection.field("product")
def resolve_box_product(obj, info):
    return info.context["product_loader"].load(obj.product_id)


@box.field("size")
def resolve_size(box_obj, info):
    return info.context["size_loader"].load(box_obj.size_id)


@query.field("box")
@convert_kwargs_to_snake_case
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == label_identifier)
        .get()
    )
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box


@query.field("location")
def resolve_location(obj, _, id):
    location = Location.get_by_id(id)
    if location.type == LocationType.ClassicLocation:
        authorize(permission="location:read", base_id=location.base_id)
        return location


@box.field("location")
def resolve_box_location(obj, _):
    authorize(permission="location:read", base_id=obj.location.base_id)
    return obj.location


@query.field("organisation")
def resolve_organisation(*_, id):
    return Organisation.get_by_id(id)


@query.field("transferAgreement")
def resolve_transfer_agreement(*_, id):
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="source"
    ) + retrieve_transfer_agreement_bases(transfer_agreement=agreement, kind="target")
    authorize(permission="transfer_agreement:read", base_ids=[b.id for b in bases])
    return agreement


@query.field("shipment")
def resolve_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:read",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return shipment


@query.field("organisations")
def resolve_organisations(*_):
    return Organisation.select()


@query.field("locations")
def resolve_locations(*_):
    return Location.select().where(
        Location.type == LocationType.ClassicLocation, authorized_bases_filter(Location)
    )


@base.field("products")
@convert_kwargs_to_snake_case
def resolve_base_products(base_obj, *_):
    authorize(permission="product:read", base_id=base_obj.id)
    return Product.select().where(
        Product.base == base_obj.id,
        # work-around for 0000-00-00 00:00:00 datetime fields in database
        (Product.deleted.is_null() | (Product.deleted == 0)),
    )


@query.field("products")
@convert_kwargs_to_snake_case
def resolve_products(*_, pagination_input=None):
    return load_into_page(
        Product,
        authorized_bases_filter(Product),
        pagination_input=pagination_input,
    )


@query.field("transferAgreements")
def resolve_transfer_agreements(*_, states=None):
    # No state filter by default
    state_filter = TransferAgreement.state << states if states else True
    return TransferAgreement.select().where(
        agreement_organisation_filter_condition() & (state_filter)
    )


@query.field("shipments")
def resolve_shipments(*_):
    return Shipment.select().orwhere(
        authorized_bases_filter(Shipment, base_fk_field_name="source_base"),
        authorized_bases_filter(Shipment, base_fk_field_name="target_base"),
    )


@tag.field("taggedResources")
def resolve_tag_tagged_resources(tag_obj, _):
    authorize(permission="tag_relation:read")
    beneficiary_relations = TagsRelation.select(TagsRelation.object_id).where(
        (TagsRelation.tag == tag_obj.id)
        & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
    )
    box_relations = TagsRelation.select(TagsRelation.object_id).where(
        (TagsRelation.tag == tag_obj.id)
        & (TagsRelation.object_type == TaggableObjectType.Box)
    )
    return list(
        Beneficiary.select().where(
            Beneficiary.id << [r.object_id for r in beneficiary_relations],
            authorized_bases_filter(Beneficiary),
        )
    ) + list(Box.select().where(Box.id << [r.object_id for r in box_relations]))


@box.field("state")
def resolve_box_state(box_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return box_obj.state_id


@classic_location.field("defaultBoxState")
def resolve_location_default_box_state(location_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return location_obj.box_state_id


@mutation.field("addPackingListEntryToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_add_packing_list_entry_to_distribution_event(*_, creation_input):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    event = DistributionEvent.get_by_id(creation_input["distribution_event_id"])
    authorize(
        permission="packing_list_entry:write", base_id=event.distribution_spot.base_id
    )
    return add_packing_list_entry_to_distribution_event(
        user_id=g.user.id, **creation_input
    )


@mutation.field("updatePackingListEntry")
@convert_kwargs_to_snake_case
def resolve_update_packing_list_entry(*_, packing_list_entry_id, number_of_items):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    entry = PackingListEntry.get_by_id(packing_list_entry_id)
    authorize(permission="packing_list_entry:write", base_id=entry.product.base_id)
    return update_packing_list_entry(
        user_id=g.user.id,
        packing_list_entry_id=packing_list_entry_id,
        number_of_items=number_of_items,
    )


@mutation.field("removeAllPackingListEntriesFromDistributionEventForProduct")
@convert_kwargs_to_snake_case
def resolve_remove_all_packing_list_entries_from_distribution_event_for_product(
    *_, distribution_event_id, product_id
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    product = Product.get_by_id(product_id)
    authorize(permission="packing_list_entry:write", base_id=product.base_id)
    return remove_all_packing_list_entries_from_distribution_event_for_product(
        user_id=g.user.id,
        distribution_event_id=distribution_event_id,
        product_id=product_id,
    )


@mutation.field("updateSelectedProductsForDistributionEventPackingList")
@convert_kwargs_to_snake_case
def resolve_set_products_for_packing_list(
    *_, distribution_event_id, product_ids_to_add, product_ids_to_remove
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(
        permission="packing_list_entry:write", base_id=event.distribution_spot.base_id
    )
    return set_products_for_packing_list(
        user_id=g.user.id,
        distribution_event_id=distribution_event_id,
        product_ids_to_add=product_ids_to_add,
        product_ids_to_remove=product_ids_to_remove,
    )


@mutation.field("startDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_start_distribution_events_tracking_group(
    *_,
    distribution_event_ids,
    base_id,
    # returned_to_location_id
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="distro_event:write", base_id=base_id)
    # TODO: do validation check that there is at least one
    # distribution event in the list
    return start_distribution_events_tracking_group(
        user_id=g.user.id,
        distribution_event_ids=distribution_event_ids,
        base_id=base_id,
        # returned_to_location_id=returned_to_location_id,
    )


@mutation.field("setReturnedNumberOfItemsForDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_track_return_of_items_for_distribution_events_tracking_group(
    *_, distribution_events_tracking_group_id, product_id, size_id, number_of_items
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    tracking_group = DistributionEventsTrackingGroup.get_by_id(
        distribution_events_tracking_group_id
    )
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return track_return_of_items_for_distribution_events_tracking_group(
        # user_id=g.user.id,
        distribution_events_tracking_group_id=distribution_events_tracking_group_id,
        product_id=product_id,
        size_id=size_id,
        number_of_items=number_of_items,
    )


@mutation.field("moveItemsFromReturnTrackingGroupToBox")
@convert_kwargs_to_snake_case
def resolve_move_items_from_return_tracking_group_to_box(
    *_,
    distribution_events_tracking_group_id,
    product_id,
    size_id,
    number_of_items,
    target_box_label_identifier,
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    tracking_group = DistributionEventsTrackingGroup.get_by_id(
        distribution_events_tracking_group_id
    )
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return move_items_from_return_tracking_group_to_box(
        # user_id=g.user.id,
        distribution_events_tracking_group_id=distribution_events_tracking_group_id,
        product_id=product_id,
        size_id=size_id,
        number_of_items=number_of_items,
        target_box_label_identifier=target_box_label_identifier,
    )


@mutation.field("removeItemsFromUnboxedItemsCollection")
@convert_kwargs_to_snake_case
def resolve_remove_items_from_unboxed_items_collection(*_, id, number_of_items):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    unboxed_items_collection = UnboxedItemsCollection.get_by_id(id)
    authorize(
        permission="distro_event:write",
        base_id=unboxed_items_collection.distribution_event.distribution_spot.base_id,
    )
    if unboxed_items_collection.number_of_items < number_of_items:
        raise Exception("Cannot remove more items than are in the collection")
    unboxed_items_collection.number_of_items -= number_of_items
    unboxed_items_collection.save()
    return unboxed_items_collection


@mutation.field("completeDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_complete_distribution_events_tracking_group(
    *_,
    id,
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    tracking_group = DistributionEventsTrackingGroup.get_by_id(id)
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return complete_distribution_events_tracking_group(
        # user_id=g.user.id,
        id=id,
    )


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(box_label_identifier=box_label_identifier)


@mutation.field("changeDistributionEventState")
@convert_kwargs_to_snake_case
def resolve_change_distribution_event_state(*_, distribution_event_id, new_state):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    event = (
        DistributionEvent.select()
        .join(Location)
        .where(DistributionEvent.id == distribution_event_id)
        .get()
    )
    authorize(permission="distro_event:write", base_id=event.distribution_spot.base_id)
    return change_distribution_event_state(distribution_event_id, new_state)


@mutation.field("createDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_create_distribution_event(*_, creation_input):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    distribution_spot = Location.get_by_id(creation_input["distribution_spot_id"])
    authorize(permission="distro_event:write", base_id=distribution_spot.base_id)
    return create_distribution_event(user_id=g.user.id, **creation_input)


@mutation.field("createDistributionSpot")
@convert_kwargs_to_snake_case
def resolve_create_distribution_spot(*_, creation_input):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="location:write", base_id=creation_input["base_id"])
    return create_distribution_spot(user_id=g.user.id, **creation_input)


@mutation.field("assignBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_assign_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    # Contemplate whether to enforce base-specific permission for box or event or both
    # Also: validate that base IDs of box location and event spot are identical
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(permission="stock:write", base_id=event.distribution_spot.base_id)
    return assign_box_to_distribution_event(box_label_identifier, distribution_event_id)


@mutation.field("unassignBoxFromDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_unassign_box_from_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="stock:write")
    return unassign_box_from_distribution_event(
        box_label_identifier, distribution_event_id
    )


@mutation.field("moveItemsFromBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_move_items_from_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id, number_of_items
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(
        permission="unboxed_items_collection:write",
        base_id=event.distribution_spot.base_id,
    )
    box = Box.get(Box.label_identifier == box_label_identifier)
    authorize(permission="stock:write", base_id=box.location.base_id)
    return move_items_from_box_to_distribution_event(
        user_id=g.user.id,
        box_label_identifier=box_label_identifier,
        distribution_event_id=distribution_event_id,
        number_of_items=number_of_items,
    )


@mutation.field("removePackingListEntryFromDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_remove_packing_list_entry_from_distribution_event(
    *_, packing_list_entry_id
):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    packing_list_entry = PackingListEntry.get(packing_list_entry_id)
    distribution_event = (
        DistributionEvent.select()
        .join(Location)
        .where(DistributionEvent.id == packing_list_entry.distribution_event)
        .get()
    )
    authorize(
        permission="distro_event:write",
        base_id=distribution_event.distribution_spot.base.id,
    )
    delete_packing_list_entry(packing_list_entry_id)
    return distribution_event


@mutation.field("createBox")
@convert_kwargs_to_snake_case
def resolve_create_box(*_, creation_input):
    requested_location = Location.get_by_id(creation_input["location_id"])
    authorize(permission="stock:write", base_id=requested_location.base_id)
    authorize(permission="location:read", base_id=requested_location.base_id)
    requested_product = Product.get_by_id(creation_input["product_id"])
    authorize(permission="product:read", base_id=requested_product.base_id)

    tag_ids = creation_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag_relation:assign", base_id=t.base_id)

    return create_box(user_id=g.user.id, **creation_input)


@mutation.field("updateBox")
@convert_kwargs_to_snake_case
def resolve_update_box(*_, update_input):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == update_input["label_identifier"])
        .get()
    )
    authorize(permission="stock:write", base_id=box.location.base_id)

    location_id = update_input.get("location_id")
    if location_id is not None:
        requested_location = Location.get_by_id(location_id)
        authorize(permission="location:read", base_id=requested_location.base_id)

    product_id = update_input.get("product_id")
    if product_id is not None:
        requested_product = Product.get_by_id(product_id)
        authorize(permission="product:read", base_id=requested_product.base_id)

    tag_ids = update_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag_relation:assign", base_id=t.base_id)

    return update_box(user_id=g.user.id, **update_input)


@mutation.field("createTag")
@convert_kwargs_to_snake_case
def resolve_create_tag(*_, creation_input):
    authorize(permission="tag:write", base_id=creation_input["base_id"])
    return create_tag(user_id=g.user.id, **creation_input)


@mutation.field("updateTag")
@convert_kwargs_to_snake_case
def resolve_update_tag(*_, update_input):
    base_id = Tag.get_by_id(update_input["id"]).base_id
    authorize(permission="tag:write", base_id=base_id)
    return update_tag(user_id=g.user.id, **update_input)


@mutation.field("assignTag")
@convert_kwargs_to_snake_case
def resolve_assign_tag(*_, assignment_input):
    tag = Tag.get_by_id(assignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return assign_tag(user_id=g.user.id, **assignment_input)


@mutation.field("unassignTag")
@convert_kwargs_to_snake_case
def resolve_unassign_tag(*_, unassignment_input):
    tag = Tag.get_by_id(unassignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return unassign_tag(user_id=g.user.id, **unassignment_input)


@mutation.field("deleteTag")
def resolve_delete_tag(*_, id):
    base_id = Tag.get_by_id(id).base_id
    authorize(permission="tag:write", base_id=base_id)
    return delete_tag(user_id=g.user.id, id=id)


@mutation.field("createTransferAgreement")
@convert_kwargs_to_snake_case
def resolve_create_transfer_agreement(*_, creation_input):
    # Enforce that the user can access at least one of the specified source bases
    # (default: all bases of the user's organisation)
    base_ids = creation_input.get(
        "source_base_ids",
        [
            b.id
            for b in Base.select().where(Base.organisation == g.user.organisation_id)
        ],
    )
    authorize(permission="transfer_agreement:create", base_ids=base_ids)
    return create_transfer_agreement(**creation_input, user=g.user)


@mutation.field("acceptTransferAgreement")
def resolve_accept_transfer_agreement(*_, id):
    # User must be member of at least one of the target bases to be authorized for
    # accepting the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    )
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(organisation_id=agreement.target_organisation_id)
    return accept_transfer_agreement(id=id, user=g.user)


@mutation.field("rejectTransferAgreement")
def resolve_reject_transfer_agreement(*_, id):
    # User must be member of at least one of the target bases to be authorized for
    # rejecting the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    )
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(organisation_id=agreement.target_organisation_id)
    return reject_transfer_agreement(id=id, user=g.user)


@mutation.field("cancelTransferAgreement")
def resolve_cancel_transfer_agreement(*_, id):
    # User must be member of at least one of the source or target bases to be authorized
    # for cancelling the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    ) + retrieve_transfer_agreement_bases(transfer_agreement=agreement, kind="source")
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(
        organisation_ids=[
            agreement.source_organisation_id,
            agreement.target_organisation_id,
        ]
    )
    return cancel_transfer_agreement(id=id, user_id=g.user.id)


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


@base.field("distributionEventsStatistics")
def resolve_base_distribution_events_statistics(base_obj, _):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="distro_event:read", base_id=base_obj.id)

    res = DistributionEventsTrackingGroup.raw(
        """select
        p.name as product_name,
        genders.label as gender_label,
        cat.label as category_label,
        siz.label as size_label,
        MAX(detl.inflow) as inflow,
        MAX(detl.outflow) as outflow,
        min(ev.planned_start_date_time) earliest_possible_distro_date,
        max(ev.planned_end_date_time) latest_possible_distro_date,
        GROUP_CONCAT(distinct spot.label SEPARATOR ', ')
          as potentially_involved_distribution_spots,
        detl.distro_event_tracking_group_id,
        GROUP_CONCAT(distinct ev.id SEPARATOR ',') as involved_distribution_event_ids,
        detl.product_id,
        detl.size_id
        from (
            select detl.distro_event_tracking_group_id,
            detl.product_id,
            detl.size_id,
            detl.location_id,
            SUM(CASE WHEN detl.flow_direction = "In"
              THEN detl.number_of_items ELSE 0 END
            ) inflow,
            SUM(CASE WHEN detl.flow_direction = "Out"
              THEN detl.number_of_items ELSE 0 END
            ) outflow
            from distro_events_tracking_logs detl
            inner join distro_events_tracking_groups tracking_group
              on tracking_group.id = detl.distro_event_tracking_group_id
            where tracking_group.base_id = '%s'
            group by detl.distro_event_tracking_group_id, detl.product_id,
              detl.size_id, detl.location_id, detl.flow_direction
        ) as detl
        inner join distro_events ev
          on ev.distro_event_tracking_group_id = detl.distro_event_tracking_group_id
        inner join locations spot on spot.id = ev.location_id
        inner join products p on p.id = detl.product_id
        inner join genders on genders.id = p.gender_id
        inner join product_categories cat on cat.id = p.category_id
        inner join sizes siz on siz.id = detl.size_id
        group by
        detl.distro_event_tracking_group_id,
        detl.product_id,
        p.name,
        genders.label,
        p.category_id,
        cat.label,
        detl.size_id""",
        base_obj.id,
    )
    return res


@base.field("locations")
def resolve_base_locations(base_obj, _):
    authorize(permission="location:read", base_id=base_obj.id)
    return Location.select().where(
        Location.base == base_obj.id,
        Location.type == LocationType.ClassicLocation,
        Location.deleted.is_null(),
    )


@base.field("tags")
@convert_kwargs_to_snake_case
def resolve_base_tags(base_obj, _, resource_type=None):
    authorize(permission="tag:read", base_id=base_obj.id)

    filter_condition = True
    if resource_type == TaggableObjectType.Box:
        filter_condition = Tag.type << [TagType.Box, TagType.All]
    elif resource_type == TaggableObjectType.Beneficiary:
        filter_condition = Tag.type << [TagType.Beneficiary, TagType.All]

    return Tag.select().where(
        Tag.base == base_obj.id, Tag.deleted.is_null(), filter_condition
    )


@query.field("distributionEventsTrackingGroup")
def resolve_distribution_events_tracking_group(*_, id):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    tracking_group = DistributionEventsTrackingGroup.get_by_id(id)
    authorize(permission="distro_event:read", base_id=tracking_group.base_id)
    return tracking_group


@query.field("distributionSpots")
def resolve_distributions_spots(base_obj, _):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    return Location.select().where(
        (Location.type == LocationType.DistributionSpot)
        & (authorized_bases_filter(Location))
    )


@base.field("distributionSpots")
def resolve_base_distributions_spots(base_obj, _):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="location:read", base_id=base_obj.id)
    base_filter_condition = Location.base == base_obj.id
    return (
        Location.select()
        .join(Base)
        .where(
            (Location.type == LocationType.DistributionSpot) & (base_filter_condition)
        )
    )


@query.field("distributionSpot")
def resolve_distributions_spot(*_, id):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    distribution_spot = Location.get_by_id(id)
    if distribution_spot.type == LocationType.DistributionSpot:
        authorize(permission="location:read", base_id=distribution_spot.base_id)
        return distribution_spot


@query.field("distributionEvent")
def resolve_distribution_event(*_, id):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    distribution_event = DistributionEvent.get_by_id(id)
    authorize(
        permission="distro_event:read",
        base_id=distribution_event.distribution_spot.base_id,
    )
    return distribution_event


@base.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_base_beneficiaries(base_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read", base_id=base_obj.id)
    base_filter_condition = Beneficiary.base == base_obj.id
    filter_condition = base_filter_condition & derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary, filter_condition, pagination_input=pagination_input
    )


@distribution_event.field("boxes")
@convert_kwargs_to_snake_case
def resolve_distribution_event_boxes(distribution_event_obj, _):
    authorize(
        permission="stock:read",
        base_id=distribution_event_obj.distribution_spot.base_id,
    )
    return Box.select().where(Box.distribution_event == distribution_event_obj.id)


@distribution_event.field("unboxedItemsCollections")
@convert_kwargs_to_snake_case
def resolve_distribution_event_unboxed_item_collections(distribution_event_obj, _):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="stock:read")
    return UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == distribution_event_obj.id
    )


@distribution_event.field("packingListEntries")
def resolve_packing_list_entries(distro_event_obj, *_):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    event = DistributionEvent.get_by_id(distro_event_obj.id)
    authorize(
        permission="packing_list_entry:read", base_id=event.distribution_spot.base_id
    )
    return PackingListEntry.select().where(
        PackingListEntry.distribution_event == distro_event_obj.id
    )


@distribution_event.field("distributionEventsTrackingGroup")
def resolve_tracking_group_of_distribution_event(distro_event_obj, *_):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(
        permission="distro_event:read",
        base_id=distro_event_obj.distribution_spot.base_id,
    )
    return distro_event_obj.distribution_events_tracking_group


@base.field("distributionEventsTrackingGroups")
def resolve_base_distribution_events_tracking_groups(base_obj, _, states=None):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="distro_event:read", base_id=base_obj.id)
    state_filter = DistributionEventsTrackingGroup.state << states if states else True
    return DistributionEventsTrackingGroup.select().where(
        (DistributionEventsTrackingGroup.base == base_obj.id) & (state_filter)
    )


@base.field("distributionEventsBeforeReturnedFromDistributionState")
def resolve_distribution_events_before_return_state(base_obj, *_):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    return (
        DistributionEvent.select()
        .join(Location, on=(DistributionEvent.distribution_spot == Location.id))
        .where(
            (Location.type == LocationType.DistributionSpot)
            & (
                DistributionEvent.state.not_in(
                    [
                        DistributionEventState.ReturnedFromDistribution,
                        DistributionEventState.ReturnTrackingInProgress,
                        DistributionEventState.Completed,
                    ]
                )
            )
            & (Location.base == base_obj.id)
        )
    )


@base.field("distributionEventsInReturnedFromDistributionState")
def resolve_distribution_events_in_return_state(base_obj, *_):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    return (
        DistributionEvent.select()
        .join(Location, on=(DistributionEvent.distribution_spot == Location.id))
        .join(Base, on=(Location.base == Base.id))
        .where(
            (Base.id == base_obj.id)
            & (Location.type == LocationType.DistributionSpot)
            & (DistributionEvent.state == DistributionEventState.Returned)
        )
    )


@distribution_spot.field("distributionEvents")
def resolve_distribution_spot_distribution_events(obj, *_):
    mobile_distro_feature_flag_check(user_id=g.user.id)
    authorize(permission="distro_event:read", base_id=obj.base_id)
    return DistributionEvent.select().where(
        DistributionEvent.distribution_spot == obj.id
    )


@classic_location.field("boxes")
@convert_kwargs_to_snake_case
def resolve_location_boxes(location_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=location_obj.base_id)
    location_filter_condition = Box.location == location_obj.id
    filter_condition = location_filter_condition & derive_box_filter(filter_input)
    selection = Box.select()
    if filter_input is not None and any(
        [f in filter_input for f in ["product_gender", "product_category_id"]]
    ):
        selection = Box.select().join(Product)
    return load_into_page(
        Box, filter_condition, selection=selection, pagination_input=pagination_input
    )


@organisation.field("bases")
def resolve_organisation_bases(organisation_obj, _):
    authorize_for_organisation_bases()
    return Base.select().where(Base.organisation_id == organisation_obj.id)


@beneficiary.field("base")
@distribution_spot.field("base")
@classic_location.field("base")
@product.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read", base_id=obj.base_id)
    return obj.base


@product.field("category")
def resolve_product_product_category(product_obj, info):
    return info.context["product_category_loader"].load(product_obj.category_id)


@product.field("sizeRange")
def resolve_product_size_range(product_obj, info):
    return info.context["size_range_loader"].load(product_obj.size_range_id)


@product.field("gender")
def resolve_product_gender(product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return product_obj.gender_id


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    box = Box.select().join(Location).where(Box.qr_code == qr_code_obj.id).get()
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box


@shipment.field("details")
def resolve_shipment_details(shipment_obj, _):
    return ShipmentDetail.select().where(
        (ShipmentDetail.shipment == shipment_obj.id)
        & (ShipmentDetail.deleted_on.is_null())
    )


@shipment.field("sourceBase")
def resolve_shipment_source_base(shipment_obj, _):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return shipment_obj.source_base


@shipment.field("targetBase")
def resolve_shipment_target_base(shipment_obj, _):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return shipment_obj.target_base


@shipment_detail.field("sourceProduct")
def resolve_shipment_detail_source_product(detail_obj, _):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.source_product


@shipment_detail.field("targetProduct")
def resolve_shipment_detail_target_product(detail_obj, _):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.target_product


@shipment_detail.field("sourceLocation")
def resolve_shipment_detail_source_location(detail_obj, _):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.source_location


@shipment_detail.field("targetLocation")
def resolve_shipment_detail_target_location(detail_obj, _):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.target_location


@transfer_agreement.field("sourceBases")
def resolve_transfer_agreement_source_bases(transfer_agreement_obj, _):
    source_bases = retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="source"
    )
    target_bases = retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="target"
    )
    authorize(
        permission="base:read", base_ids=[b.id for b in source_bases + target_bases]
    )
    return source_bases


@transfer_agreement.field("targetBases")
def resolve_transfer_agreement_target_bases(transfer_agreement_obj, _):
    source_bases = retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="source"
    )
    target_bases = retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="target"
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
