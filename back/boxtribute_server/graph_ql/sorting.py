from peewee import JOIN

from ..enums import BoxSortField
from ..models.definitions.box import Box
from ..models.definitions.box_state import BoxState
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.size import Size


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
        # The gender is sorted by ID, i.e. in the order of the ProductGender enum
        sort_field = sort_product.gender
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
    return selection, sort_field
