from ariadne import ObjectType

from ....authz import authorized_bases_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.product import Product

product_category = ObjectType("ProductCategory")


@product_category.field("hasGender")
def resolve_product_category_has_gender(product_category_obj, _):
    # Only categories derived from 'Clothing' (ID 12) have gender information
    return product_category_obj.parent_id == 12


@product_category.field("products")
def resolve_product_category_products(product_category_obj, _, pagination_input=None):
    category_filter_condition = Product.category == product_category_obj.id
    return load_into_page(
        Product,
        authorized_bases_filter(Product),
        category_filter_condition,
        pagination_input=pagination_input,
    )
