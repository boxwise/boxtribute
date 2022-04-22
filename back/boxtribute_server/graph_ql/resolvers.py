"""GraphQL resolver functionality"""
from datetime import date

from ariadne import MutationType, ObjectType, QueryType, convert_kwargs_to_snake_case
from flask import g
from peewee import fn

from ..authz import authorize
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
from ..enums import HumanGender, TransferAgreementType
from ..models.crud import (
    create_beneficiary,
    create_box,
    create_qr_code,
    update_beneficiary,
    update_box,
)
from ..models.definitions.base import Base
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.definitions.location import Location
from ..models.definitions.organisation import Organisation
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.qr_code import QrCode
from ..models.definitions.shipment import Shipment
from ..models.definitions.shipment_detail import ShipmentDetail
from ..models.definitions.size import Size
from ..models.definitions.transaction import Transaction
from ..models.definitions.transfer_agreement import TransferAgreement
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


def _register_object_type(name):
    object_type = ObjectType(name)
    object_types.append(object_type)
    return object_type


base = _register_object_type("Base")
beneficiary = _register_object_type("Beneficiary")
box = _register_object_type("Box")
location = _register_object_type("Location")
metrics = _register_object_type("Metrics")
organisation = _register_object_type("Organisation")
product = _register_object_type("Product")
product_category = _register_object_type("ProductCategory")
qr_code = _register_object_type("QrCode")
shipment = _register_object_type("Shipment")
shipment_detail = _register_object_type("ShipmentDetail")
transfer_agreement = _register_object_type("TransferAgreement")
user = _register_object_type("User")
stockAvailability = _register_object_type("StockAvailability")


def _base_filter_condition(permission):
    """Derive filter condition for given permission depending the current user's
    base-specific permissions. See also `auth.requires_auth()`.
    """
    base_ids = g.user.authorized_base_ids(permission)
    if base_ids is None:
        # Permission granted for all bases
        return True
    return Base.id << base_ids


@user.field("bases")
@query.field("bases")
def resolve_bases(*_):
    authorize(permission="base:read")
    return Base.select().where(_base_filter_condition("base:read"))









# @location.field("boxes")
# @convert_kwargs_to_snake_case
# def resolve_location_boxes(location_obj, _, pagination_input=None, filter_input=None):
#     authorize(permission="stock:read")
#     location_filter_condition = Box.location == location_obj.id
#     filter_condition = location_filter_condition & derive_box_filter(filter_input)
#     selection = Box.select()
#     if filter_input is not None and any(
#         [f in filter_input for f in ["product_gender", "product_category_id"]]
#     ):
#         selection = Box.select().join(Product)
#     return load_into_page(
#         Box, filter_condition, selection=selection, pagination_input=pagination_input
#     )




# @stockAvailability.field("locations")
# @convert_kwargs_to_snake_case
# def resolve_stock_availability_locations(stock_availability, _): 
#     print("FOO: stock_availability")
#     print(stock_availability)
#     locations_for_base = Location.select().where(Location.base == stock_availability["base_id"])
#     return locations_for_base


@base.field("stockAvailabilities")
@convert_kwargs_to_snake_case
def resolve_base_stock_availabilities(base_obj, _): 
    
    print("convert_kwargs_to_snake_case - base_obj.id")
    print(base_obj.id)
    print(base_obj.name)
    boxes_for_base = Location.select().where(Location.base == base_obj.id).join(Box).join(Product).join(Size).select(Size.label).group_by(Product.id, Box.size)
    print("FOO - boxes_for_base")
    print(boxes_for_base)
    # print("FOO - obj")
    # print(obj)
    # print("FOO - id")
    # print(id)
    return [
        {
            "stock_number": 123, 
            "size": "S", 
            "base_id": base_obj.id
        },
        {
            "stock_number": 975293939, 
            "size": "XL",
            "base_id": base_obj.id
        }
    ]


@stockAvailability.field("product")
def resolve_stock_availability_product(*_): 
    product = Product.get()
    return product






@query.field("base")
def resolve_base(*_, id):
    authorize(permission="base:read", base_id=int(id))
    return Base.get_by_id(id)


@query.field("beneficiary")
def resolve_beneficiary(*_, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(permission="beneficiary:read", base_id=beneficiary.base_id)
    return beneficiary


@query.field("users")
def resolve_users(*_):
    authorize(permission="user:read")
    return User.select()


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


@query.field("product")
@box.field("product")
def resolve_product(obj, _, id=None):
    # print("resolve_product#obj")
    # print(obj)
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
@box.field("location")
def resolve_location(obj, _, id=None):
    location = obj.location if id is None else Location.get_by_id(id)
    authorize(permission="location:read", base_id=location.base_id)
    return location


@query.field("organisation")
def resolve_organisation(*_, id):
    authorize(organisation_id=int(id))
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
    return Location.select().join(Base).where(_base_filter_condition("location:read"))


@query.field("products")
@convert_kwargs_to_snake_case
def resolve_products(*_, pagination_input=None):
    authorize(permission="product:read")
    return load_into_page(
        Product,
        _base_filter_condition("product:read"),
        selection=Product.select().join(Base),
        pagination_input=pagination_input,
    )


@query.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_beneficiaries(*_, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read")
    filter_condition = derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary,
        _base_filter_condition("beneficiary:read") & filter_condition,
        selection=Beneficiary.select().join(Base),
        pagination_input=pagination_input,
    )


@query.field("transferAgreements")
def resolve_transfer_agreements(*_, states=None):
    authorize(permission="transfer_agreement:read")
    user_organisation_id = g.user.organisation_id
    # No state filter by default
    state_filter = TransferAgreement.state << states if states else True
    return TransferAgreement.select().where(
        (
            (TransferAgreement.source_organisation == user_organisation_id)
            | (TransferAgreement.target_organisation == user_organisation_id)
        )
        & (state_filter)
    )


@query.field("shipments")
def resolve_shipments(*_):
    authorize(permission="shipment:read")
    user_organisation_id = g.user.organisation_id
    return (
        Shipment.select()
        .join(TransferAgreement)
        .where(
            (TransferAgreement.source_organisation == user_organisation_id)
            | (TransferAgreement.target_organisation == user_organisation_id)
        )
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


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    authorize(permission="stock:write")
    return create_qr_code(box_label_identifier=box_label_identifier)


@mutation.field("createBox")
@convert_kwargs_to_snake_case
def resolve_create_box(*_, creation_input):
    authorize(permission="stock:write")
    return create_box(user_id=g.user.id, **creation_input)


@mutation.field("updateBox")
@convert_kwargs_to_snake_case
def resolve_update_box(*_, update_input):
    authorize(permission="stock:write")
    return update_box(user_id=g.user.id, **update_input)


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
    print("resolve_base_locations - base_obj.id")
    print(base_obj.id)
    authorize(permission="location:read")
    return Location.select().where(Location.base == base_obj.id)


@base.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_base_beneficiaries(base_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read")
    base_filter_condition = Beneficiary.base == base_obj.id
    filter_condition = base_filter_condition & derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary, filter_condition, pagination_input=pagination_input
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
@location.field("base")
@product.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read")
    return obj.base


@product.field("gender")
def resolve_product_gender(product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return product_obj.gender.id


@product.field("sizes")
def resolve_product_sizes(product_id, _):
    product = Product.get_by_id(product_id)
    sizes = Size.select(Size.label).where(Size.seq == product.size_range.seq)
    return [size.label for size in sizes]


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
