"""GraphQL resolver functionality"""
from datetime import date

from ariadne import (
    InterfaceType,
    MutationType,
    ObjectType,
    QueryType,
    UnionType,
    convert_kwargs_to_snake_case,
)
from flask import g
from peewee import fn

from ..authz import (
    agreement_organisation_filter_condition,
    authorize,
    base_filter_condition,
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
from ..enums import HumanGender, LocationType, TaggableObjectType, TransferAgreementType
from ..mobile_distribution.crud import (
    add_packing_list_entry_to_distribution_event,
    change_distribution_event_state,
    create_distribution_event,
    create_distribution_spot,
    delete_packing_list_entry,
    move_box_to_distribution_event,
    move_items_from_box_to_distribution_event,
    remove_all_packing_list_entries_from_distribution_event_for_product,
    set_products_for_packing_list,
    update_packing_list_entry,
)
from ..models.crud import (
    create_beneficiary,
    create_box,
    create_qr_code,
    create_tag,
    delete_tag,
    update_beneficiary,
    update_box,
    update_tag,
)
from ..models.definitions.base import Base
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.definitions.distribution_event import DistributionEvent
from ..models.definitions.location import Location
from ..models.definitions.organisation import Organisation
from ..models.definitions.packing_list_entry import PackingListEntry
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.qr_code import QrCode
from ..models.definitions.shipment import Shipment
from ..models.definitions.shipment_detail import ShipmentDetail
from ..models.definitions.size import Size
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation
from ..models.definitions.transaction import Transaction
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.definitions.unboxed_items_collection import UnboxedItemsCollection
from ..models.definitions.user import User
from ..models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ..models.metrics import (
    compute_moved_stock_overview,
    compute_number_of_beneficiaries_served,
    compute_number_of_families_served,
    compute_number_of_sales,
    compute_stock_overview,
)
from .filtering import derive_beneficiary_filter, derive_box_filter
from .pagination import load_into_page

query = QueryType()
mutation = MutationType()
object_types = []
union_types = []
interface_types = []


def _register_object_type(name):
    object_type = ObjectType(name)
    object_types.append(object_type)
    return object_type


base = _register_object_type("Base")
beneficiary = _register_object_type("Beneficiary")
box = _register_object_type("Box")
distribution_event = _register_object_type("DistributionEvent")
distribution_spot = _register_object_type("DistributionSpot")
location = _register_object_type("Location")
metrics = _register_object_type("Metrics")
organisation = _register_object_type("Organisation")
packing_list_entry = _register_object_type("PackingListEntry")
product = _register_object_type("Product")
product_category = _register_object_type("ProductCategory")
qr_code = _register_object_type("QrCode")
shipment = _register_object_type("Shipment")
shipment_detail = _register_object_type("ShipmentDetail")
size = _register_object_type("Size")
size_range = _register_object_type("SizeRange")
tag = _register_object_type("Tag")
transfer_agreement = _register_object_type("TransferAgreement")
unboxed_items_collection = _register_object_type("UnboxedItemsCollection")
user = _register_object_type("User")


@query.field("tag")
def resolve_tag(*_, id):
    tag = Tag.get_by_id(id)
    authorize(permission="tag:read", base_id=tag.base_id)
    return tag


@query.field("tags")
def resolve_tags(*_):
    authorize(permission="tag:read")
    return Tag.select().where(Tag.deleted.is_null() & base_filter_condition(Tag))


@query.field("packingListEntry")
def resolve_packing_list_entry(*_, id):
    authorize(permission="packing_list_entry:read")
    return PackingListEntry.get_by_id(id)


@packing_list_entry.field("matchingPackedItemsCollections")
def resolve_packing_list_entry_matching_packed_items_collections(obj, *_):
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


@user.field("bases")
@query.field("bases")
def resolve_bases(*_):
    authorize(permission="base:read")
    return Base.select().where(base_filter_condition())


@query.field("base")
def resolve_base(*_, id):
    authorize(permission="base:read", base_id=int(id))
    return Base.get_by_id(id)


@query.field("beneficiary")
def resolve_beneficiary(*_, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(permission="beneficiary:read", base_id=beneficiary.base_id)
    return beneficiary


@base.field("distributionEvents")
def resolve_distributions_events(base_obj, _):
    authorize(
        permission="distro_event:read",
    )
    distribution_events = (
        DistributionEvent.select()
        .join(Location, on=(DistributionEvent.distribution_spot == Location.id))
        .join(Base, on=(Location.base == Base.id))
        .where(Base.id == base_obj.id & Location.type == LocationType.DistributionSpot)
    )
    return distribution_events


@query.field("users")
def resolve_users(*_):
    authorize(permission="user:read")
    # Disable for non-god users until integration of Auth0 implemented
    return User.select() if g.user.is_god else []


@query.field("user")
def resolve_user(*_, id):
    authorize(permission="user:read")
    authorize(user_id=int(id))
    return User.get_by_id(id)


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
def resolve_box_tags(box_obj, _):
    return (
        Tag.select()
        .join(TagsRelation)
        .where(
            (TagsRelation.object_id == box_obj.id)
            & (TagsRelation.object_type == TaggableObjectType.Box)
        )
    )


@query.field("product")
@box.field("product")
@unboxed_items_collection.field("product")
def resolve_product(obj, _, id=None):
    product = obj.product if id is None else Product.get_by_id(id)
    authorize(permission="product:read", base_id=product.base_id)
    return product


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
    if location.type == LocationType.Location:
        authorize(permission="location:read", base_id=location.base_id)
        return location


@box.field("place")
def resolve_box_place(obj, _):
    authorize(permission="location:read", base_id=obj.location.base_id)
    return obj.location


@query.field("organisation")
def resolve_organisation(*_, id):
    return Organisation.get_by_id(id)


@query.field("productCategory")
def resolve_product_category(*_, id):
    authorize(permission="category:read")
    return ProductCategory.get_by_id(id)


@query.field("transferAgreement")
def resolve_transfer_agreement(*_, id):
    authorize(permission="transfer_agreement:read")
    return TransferAgreement.get_by_id(id)


@query.field("shipment")
def resolve_shipment(*_, id):
    authorize(permission="shipment:read")
    return Shipment.get_by_id(id)


@query.field("productCategories")
def resolve_product_categories(*_):
    authorize(permission="category:read")
    return ProductCategory.select()


@query.field("organisations")
def resolve_organisations(*_):
    return Organisation.select()


@query.field("locations")
def resolve_locations(*_):
    authorize(permission="location:read")
    return Location.select().where(
        Location.type == LocationType.Location & base_filter_condition(Location)
    )


@query.field("products")
@convert_kwargs_to_snake_case
def resolve_products(*_, pagination_input=None):
    authorize(permission="product:read")
    return load_into_page(
        Product,
        base_filter_condition(Product),
        pagination_input=pagination_input,
    )


@query.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_beneficiaries(*_, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read")
    filter_condition = derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary,
        base_filter_condition(Beneficiary) & filter_condition,
        pagination_input=pagination_input,
    )


@query.field("transferAgreements")
def resolve_transfer_agreements(*_, states=None):
    authorize(permission="transfer_agreement:read")
    # No state filter by default
    state_filter = TransferAgreement.state << states if states else True
    return TransferAgreement.select().where(
        agreement_organisation_filter_condition() & (state_filter)
    )


@query.field("shipments")
def resolve_shipments(*_):
    authorize(permission="shipment:read")
    return (
        Shipment.select()
        .join(TransferAgreement)
        .where(agreement_organisation_filter_condition())
    )


@query.field("metrics")
@convert_kwargs_to_snake_case
def resolve_metrics(*_, organisation_id=None):
    # Default to current user's organisation ID
    organisation_id = organisation_id or g.user.organisation_id
    # Non-god users are only permitted to fetch their organisation's metrics, the god
    # user however can access any organisation's metrics
    authorize(organisation_id=organisation_id)

    # Pass organisation ID to child resolvers
    return {"organisation_id": organisation_id}


@tag.field("taggedResources")
def resolve_tag_tagged_resources(tag_obj, _):
    # # TODO Add correct permissions herer
    # # authorize(permission="tag:read")
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
            Beneficiary.id << [r.object_id for r in beneficiary_relations]
        )
    ) + list(Box.select().where(Box.id << [r.object_id for r in box_relations]))


@beneficiary.field("tags")
def resolve_beneficiary_tags(beneficiary_obj, _):
    return (
        Tag.select()
        .join(TagsRelation)
        .where(
            (TagsRelation.object_id == beneficiary_obj.id)
            & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
        )
    )


@beneficiary.field("tokens")
def resolve_beneficiary_tokens(beneficiary_obj, _):
    authorize(permission="transaction:read")
    # If the beneficiary has no transactions yet, the select query returns None
    return (
        Transaction.select(fn.sum(Transaction.tokens))
        .where(Transaction.beneficiary == beneficiary_obj.id)
        .scalar()
        or 0
    )


@beneficiary.field("transactions")
def resolve_beneficiary_transactions(beneficiary_obj, _):
    authorize(permission="transaction:read")
    return Transaction.select().where(Transaction.beneficiary == beneficiary_obj.id)


@beneficiary.field("registered")
def resolve_beneficiary_registered(beneficiary_obj, _):
    return not beneficiary_obj.not_registered


@beneficiary.field("languages")
def resolve_beneficiary_languages(beneficiary_obj, _):
    return [
        x.language.id
        for x in XBeneficiaryLanguage.select().where(
            XBeneficiaryLanguage.beneficiary == beneficiary_obj.id
        )
    ]


@beneficiary.field("gender")
def resolve_beneficiary_gender(beneficiary_obj, _):
    if beneficiary_obj.gender == "":
        return
    return HumanGender(beneficiary_obj.gender)


@beneficiary.field("age")
def resolve_beneficiary_age(beneficiary_obj, _):
    dob = beneficiary_obj.date_of_birth
    if dob is None:
        return
    today = date.today()
    # Subtract 1 if current day is before birthday in current year
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


@beneficiary.field("active")
def resolve_beneficiary_active(beneficiary_obj, _):
    return beneficiary_obj.deleted is None  # ZeroDateTimeField


@box.field("state")
def resolve_box_state(box_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return box_obj.state_id


@location.field("defaultBoxState")
def resolve_location_default_box_state(location_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return location_obj.box_state.id


@mutation.field("addPackingListEntryToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_add_packing_list_entry_to_distribution_event(*_, creation_input):
    authorize(permission="packing_list_entry:write")
    return add_packing_list_entry_to_distribution_event(
        user_id=g.user.id, **creation_input
    )


@mutation.field("updatePackingListEntry")
@convert_kwargs_to_snake_case
def resolve_update_packing_list_entry(*_, packing_list_entry_id, number_of_items):
    authorize(permission="packing_list_entry:write")
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
    authorize(permission="packing_list_entry:write")
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
    authorize(permission="packing_list_entry:write")
    return set_products_for_packing_list(
        user_id=g.user.id,
        distribution_event_id=distribution_event_id,
        product_ids_to_add=product_ids_to_add,
        product_ids_to_remove=product_ids_to_remove,
    )


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    authorize(permission="stock:write")
    return create_qr_code(box_label_identifier=box_label_identifier)


@mutation.field("changeDistributionEventState")
@convert_kwargs_to_snake_case
def resolve_change_distribution_event_state(*_, distribution_event_id, new_state):
    authorize(permission="distro_event:write")
    return change_distribution_event_state(distribution_event_id, new_state)


@mutation.field("createDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_create_distribution_event(*_, creation_input):
    authorize(permission="distro_event:write")
    return create_distribution_event(user_id=g.user.id, **creation_input)


@mutation.field("createDistributionSpot")
@convert_kwargs_to_snake_case
def resolve_create_distribution_spot(*_, creation_input):
    authorize(permission="location:write")
    return create_distribution_spot(user_id=g.user.id, **creation_input)


@mutation.field("moveBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_move_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id
):
    authorize(permission="stock:write")
    return move_box_to_distribution_event(box_label_identifier, distribution_event_id)


@mutation.field("moveItemsFromBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_move_items_from_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id, number_of_items
):
    authorize(permission="unboxed_items_collection:write")
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
    authorize(permission="stock:write")
    requested_location = Location.get_by_id(creation_input["location_id"])
    authorize(permission="location:read", base_id=requested_location.base_id)
    requested_product = Product.get_by_id(creation_input["product_id"])
    authorize(permission="product:read", base_id=requested_product.base_id)
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


@mutation.field("deleteTag")
def resolve_delete_tag(*_, id):
    base_id = Tag.get_by_id(id).base_id
    authorize(permission="tag:write", base_id=base_id)
    return delete_tag(user_id=g.user.id, id=id)


@mutation.field("createBeneficiary")
@convert_kwargs_to_snake_case
def resolve_create_beneficiary(*_, creation_input):
    authorize(permission="beneficiary:create", base_id=creation_input["base_id"])
    return create_beneficiary(**creation_input, user=g.user)


@mutation.field("updateBeneficiary")
@convert_kwargs_to_snake_case
def resolve_update_beneficiary(*_, update_input):
    # Use target base ID if specified, otherwise skip enforcing base-specific authz
    authorize(permission="beneficiary:edit", base_id=update_input.get("base_id"))
    return update_beneficiary(**update_input, user=g.user)


@mutation.field("createTransferAgreement")
@convert_kwargs_to_snake_case
def resolve_create_transfer_agreement(*_, creation_input):
    authorize(permission="transfer_agreement:create")
    return create_transfer_agreement(**creation_input, user=g.user)


@mutation.field("acceptTransferAgreement")
def resolve_accept_transfer_agreement(*_, id):
    authorize(permission="transfer_agreement:edit")
    agreement = TransferAgreement.get_by_id(id)
    authorize(organisation_id=agreement.target_organisation_id)
    return accept_transfer_agreement(id=id, user=g.user)


@mutation.field("rejectTransferAgreement")
def resolve_reject_transfer_agreement(*_, id):
    authorize(permission="transfer_agreement:edit")
    agreement = TransferAgreement.get_by_id(id)
    authorize(organisation_id=agreement.target_organisation_id)
    return reject_transfer_agreement(id=id, user=g.user)


@mutation.field("cancelTransferAgreement")
def resolve_cancel_transfer_agreement(*_, id):
    authorize(permission="transfer_agreement:edit")
    agreement = TransferAgreement.get_by_id(id)
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
    authorize(permission="shipment:create")
    agreement = TransferAgreement.get_by_id(creation_input["transfer_agreement_id"])
    organisation_ids = [agreement.source_organisation_id]
    if agreement.type == TransferAgreementType.Bidirectional:
        organisation_ids.append(agreement.target_organisation_id)
    authorize(organisation_ids=organisation_ids)
    return create_shipment(**creation_input, user=g.user)


@mutation.field("updateShipment")
@convert_kwargs_to_snake_case
def resolve_update_shipment(*_, update_input):
    authorize(permission="shipment:edit")

    shipment = Shipment.get_by_id(update_input["id"])
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
    authorize(permission="shipment:edit")
    shipment = Shipment.get_by_id(id)
    authorize(
        organisation_ids=[
            shipment.transfer_agreement.source_organisation_id,
            shipment.transfer_agreement.target_organisation_id,
        ]
    )
    return cancel_shipment(id=id, user=g.user)


@mutation.field("sendShipment")
def resolve_send_shipment(*_, id):
    authorize(permission="shipment:edit")
    shipment = Shipment.get_by_id(id)
    authorize(organisation_id=shipment.source_base.organisation_id)
    return send_shipment(id=id, user=g.user)


@base.field("locations")
def resolve_base_locations(base_obj, _):
    authorize(permission="location:read")
    return Location.select().where(Location.base == base_obj.id)


@query.field("distributionSpots")
def resolve_distributions_spots(base_obj, _):
    authorize(permission="location:read")
    return (
        Location.select()
        .where(Location.type == LocationType.DistributionSpot)
        .where(base_filter_condition(Location))
    )


@base.field("distributionSpots")
def resolve_base_distributions_spots(base_obj, _):
    authorize(permission="location:read")
    base_filter_condition = Location.base == base_obj.id
    return (
        Location.select()
        .join(Base)
        .where(Location.type == LocationType.DistributionSpot)
        .where(base_filter_condition)
    )


@query.field("distributionSpot")
def resolve_distributions_spot(*_, id):
    distribution_spot = Location.get_by_id(id)
    if distribution_spot.type == LocationType.DistributionSpot:
        authorize(permission="location:read", base_id=distribution_spot.base_id)
        return distribution_spot
    else:
        None


@query.field("distributionEvent")
def resolve_distribution_event(obj, _, id):
    distribution_event = (
        obj.distribution_event if id is None else DistributionEvent.get_by_id(id)
    )
    authorize(
        permission="distro_event:read",
        base_id=distribution_event.distribution_spot.base.id,
    )
    return distribution_event


@base.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_base_beneficiaries(base_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read")
    base_filter_condition = Beneficiary.base == base_obj.id
    filter_condition = base_filter_condition & derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary, filter_condition, pagination_input=pagination_input
    )


@distribution_event.field("boxes")
@convert_kwargs_to_snake_case
def resolve_distribution_event_boxes(distribution_event_obj, _):
    authorize(permission="stock:read")
    return Box.select().where(Box.distribution_event == distribution_event_obj.id)


@distribution_event.field("unboxedItemsCollections")
@convert_kwargs_to_snake_case
def resolve_distribution_event_unboxed_item_collections(distribution_event_obj, _):
    authorize(permission="stock:read")
    return UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == distribution_event_obj.id
    )


@distribution_event.field("packingListEntries")
def resolve_packing_list_entries(obj, *_):
    return PackingListEntry.select().where(
        PackingListEntry.distribution_event == obj.id
    )


@distribution_spot.field("distributionEvents")
def resolve_distribution_spot_distribution_events(obj, *_):
    authorize(permission="distro_event:read")
    return DistributionEvent.select().where(
        DistributionEvent.distribution_spot == obj.id
    )


@location.field("boxes")
@convert_kwargs_to_snake_case
def resolve_location_boxes(location_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="stock:read")
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


@metrics.field("numberOfFamiliesServed")
def resolve_metrics_number_of_families_served(metrics_obj, _, after=None, before=None):
    return compute_number_of_families_served(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@metrics.field("numberOfBeneficiariesServed")
def resolve_metrics_number_of_beneficiaries_served(
    metrics_obj, _, after=None, before=None
):
    return compute_number_of_beneficiaries_served(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@metrics.field("numberOfSales")
def resolve_metrics_number_of_sales(metrics_obj, _, after=None, before=None):
    return compute_number_of_sales(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@metrics.field("stockOverview")
def resolve_metrics_stock_overview(metrics_obj, _):
    return compute_stock_overview(organisation_id=metrics_obj["organisation_id"])


@metrics.field("movedStockOverview")
def resolve_metrics_moved_stock_overview(metrics_obj, _, after=None, before=None):
    return compute_moved_stock_overview(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@organisation.field("bases")
def resolve_organisation_bases(organisation_obj, _):
    authorize(permission="base:read")
    return Base.select().where(Base.organisation_id == organisation_obj.id)


@beneficiary.field("base")
@distribution_spot.field("base")
@location.field("base")
@product.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read")
    return obj.base


@product.field("gender")
def resolve_product_gender(product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return product_obj.gender_id


@product_category.field("hasGender")
def resolve_product_category_has_gender(product_category_obj, _):
    # Only categories derived from 'Clothing' (ID 12) have gender information
    return product_category_obj.parent_id == 12


@product_category.field("products")
@convert_kwargs_to_snake_case
def resolve_product_category_products(product_category_obj, _, pagination_input=None):
    authorize(permission="product:read")
    category_filter_condition = Product.category == product_category_obj.id
    return load_into_page(
        Product, category_filter_condition, pagination_input=pagination_input
    )


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    authorize(permission="stock:read")
    return Box.get(Box.qr_code == qr_code_obj.id)


@shipment.field("details")
def resolve_shipment_details(shipment_obj, _):
    return ShipmentDetail.select().where(
        (ShipmentDetail.shipment == shipment_obj.id)
        & (ShipmentDetail.deleted_on.is_null())
    )


@shipment.field("sourceBase")
def resolve_shipment_source_base(shipment_obj, _):
    authorize(permission="base:read")
    return shipment_obj.source_base


@shipment.field("targetBase")
def resolve_shipment_target_base(shipment_obj, _):
    authorize(permission="base:read")
    return shipment_obj.target_base


@shipment_detail.field("sourceProduct")
def resolve_shipment_detail_source_product(detail_obj, _):
    authorize(permission="product:read")
    return detail_obj.source_product


@shipment_detail.field("targetProduct")
def resolve_shipment_detail_target_product(detail_obj, _):
    authorize(permission="product:read")
    return detail_obj.target_product


@shipment_detail.field("sourceLocation")
def resolve_shipment_detail_source_location(detail_obj, _):
    authorize(permission="location:read")
    return detail_obj.source_location


@shipment_detail.field("targetLocation")
def resolve_shipment_detail_target_location(detail_obj, _):
    authorize(permission="location:read")
    return detail_obj.target_location


@size_range.field("sizes")
def resolve_size_range_sizes(size_range_obj, _):
    return Size.select().where((Size.size_range == size_range_obj.id))


@transfer_agreement.field("sourceBases")
def resolve_transfer_agreement_source_bases(transfer_agreement_obj, _):
    authorize(permission="base:read")
    return retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="source"
    )


@transfer_agreement.field("targetBases")
def resolve_transfer_agreement_target_bases(transfer_agreement_obj, _):
    authorize(permission="base:read")
    return retrieve_transfer_agreement_bases(
        transfer_agreement=transfer_agreement_obj, kind="target"
    )


@transfer_agreement.field("shipments")
def resolve_transfer_agreement_shipments(transfer_agreement_obj, _):
    authorize(permission="shipment:read")
    return Shipment.select().where(
        Shipment.transfer_agreement == transfer_agreement_obj.id
    )


@user.field("organisation")
def resolve_user_organisation(*_):
    return Organisation.get_by_id(g.user.organisation_id)


def resolve_taggable_resource_type(obj, *_):
    if isinstance(obj, Box):
        return "Box"
    return "Beneficiary"


def resolve_box_place_type(obj, *_):
    return obj.type.name


def resolve_items_collection_type(obj, *_):
    return obj.items_collection_type


union_types.append(UnionType("TaggableResource", resolve_taggable_resource_type))
interface_types.append(InterfaceType("BoxPlace", resolve_box_place_type))
interface_types.append(InterfaceType("ItemsCollection", resolve_items_collection_type))
