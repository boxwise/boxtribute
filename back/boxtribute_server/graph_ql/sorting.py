from peewee import JOIN, fn

from ..enums import BeneficiarySortField, BoxSortField
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.definitions.box_state import BoxState
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.product_gender import ProductGender
from ..models.definitions.size import Size
from ..models.definitions.transaction import Transaction


def derive_box_sorting(selection, sort_by):
    """Join the tables required for sorting the given Box selection by the specified
    field. Return the extended selection and the field to sort by.
    The joined tables are aliased in order to avoid clashes with joins that are added
    when filters are derived.
    """
    sort_field = Box.last_modified_on
    if sort_by == BoxSortField.LabelIdentifier:
        sort_field = Box.label_identifier
    elif sort_by == BoxSortField.NumberOfItems:
        sort_field = Box.number_of_items
    elif sort_by == BoxSortField.Weight:
        sort_field = Box.weight
    elif sort_by == BoxSortField.MonetaryValue:
        sort_field = Box.monetary_value
    elif sort_by == BoxSortField.Comment:
        sort_field = Box.comment
    elif sort_by == BoxSortField.LocationName:
        sort_field = Location.name  # Location is joined in any case
    elif sort_by == BoxSortField.Age:
        sort_field = Box.created_on
    elif sort_by == BoxSortField.SizeName:
        sort_size = Size.alias("sort_size")
        selection = selection.join(
            sort_size, JOIN.LEFT_OUTER, on=(sort_size.id == Box.size), src=Box
        )
        sort_field = sort_size.label
    elif sort_by == BoxSortField.State:
        sort_state = BoxState.alias("sort_state")
        selection = selection.join(sort_state, src=Box)
        sort_field = sort_state.label
    elif sort_by in (
        BoxSortField.ProductName,
        BoxSortField.ProductGender,
        BoxSortField.CategoryName,
    ):
        sort_product = Product.alias("sort_product")
        selection = selection.join(
            sort_product, on=(sort_product.id == Box.product), src=Box
        )
        if sort_by == BoxSortField.ProductName:
            sort_field = sort_product.name
        elif sort_by == BoxSortField.CategoryName:
            sort_category = ProductCategory.alias("sort_category")
            selection = selection.join(
                sort_category,
                on=(sort_category.id == sort_product.category),
                src=sort_product,
            )
            sort_field = sort_category.name
        else:  # ProductGender
            sort_gender = ProductGender.alias("sort_gender")
            selection = selection.join(
                sort_gender,
                on=(sort_gender.id == sort_product.gender),
                src=sort_product,
            )
            sort_field = sort_gender.label
    return selection, sort_field


def compute_beneficiary_last_active_on(model):
    """Return a peewee expression computing the most recent activity date for the
    given Beneficiary selectable (model or alias): the latest of creation date, last
    modification date, or the date of the last transaction executed by the
    beneficiary's family head (transactions are always associated with the family
    head, never with a family member).
    """
    head_id = fn.COALESCE(model.family_head, model.id)
    last_transaction_on = Transaction.select(fn.MAX(Transaction.created_on)).where(
        Transaction.beneficiary == head_id
    )
    return fn.GREATEST(
        model.created_on,
        fn.COALESCE(model.last_modified_on, model.created_on),
        fn.COALESCE(last_transaction_on, model.created_on),
    )


def derive_beneficiary_sorting(selection, sort_by):
    """Join the tables required for sorting the given Beneficiary selection by the
    specified field. Return the extended selection and the field to sort by.
    The joined tables are aliased in order to avoid clashes with joins that are added
    when filters are derived.
    """
    if sort_by == BeneficiarySortField.FirstName:
        sort_field = Beneficiary.first_name
    elif sort_by == BeneficiarySortField.Gender:
        sort_field = Beneficiary.gender
    elif sort_by == BeneficiarySortField.Age:
        # Smallest (earliest) date of birth means largest age
        sort_field = Beneficiary.date_of_birth
    elif sort_by == BeneficiarySortField.GroupIdentifier:
        sort_field = Beneficiary.group_identifier
    elif sort_by == BeneficiarySortField.CreatedOn:
        sort_field = Beneficiary.created_on
    elif sort_by == BeneficiarySortField.Email:
        sort_field = Beneficiary.email
    elif sort_by == BeneficiarySortField.Phone:
        sort_field = Beneficiary.phone_number
    elif sort_by == BeneficiarySortField.CustomTextField1:
        sort_field = Beneficiary.custom_text_field_1
    elif sort_by == BeneficiarySortField.CustomTextField2:
        sort_field = Beneficiary.custom_text_field_2
    elif sort_by == BeneficiarySortField.Tokens:
        sort_transaction = Transaction.alias("sort_transaction")
        selection = selection.join(
            sort_transaction,
            JOIN.LEFT_OUTER,
            on=(sort_transaction.beneficiary == Beneficiary.id),
            src=Beneficiary,
        ).group_by(Beneficiary.id)
        sort_field = fn.COALESCE(fn.SUM(sort_transaction.tokens), 0)
    elif sort_by == BeneficiarySortField.LastActiveOn:
        sort_field = compute_beneficiary_last_active_on(Beneficiary)
    else:
        # Default (BeneficiarySortField.LastName): sort by the last name of the
        # family head, or the beneficiary's own last name if they're a family head
        # themselves. This intentionally groups family members near their family
        # head, without guaranteeing that an entire family ends up on the same page
        sort_head = Beneficiary.alias("sort_head")
        selection = selection.join(
            sort_head,
            JOIN.LEFT_OUTER,
            on=(sort_head.id == Beneficiary.family_head),
            src=Beneficiary,
        )
        sort_field = fn.COALESCE(sort_head.last_name, Beneficiary.last_name)
    return selection, sort_field
