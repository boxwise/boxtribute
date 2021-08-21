from data.base import create_default_bases
from data.beneficiary import create_default_beneficiary
from data.box import create_default_box
from data.box_state import create_default_box_state
from data.location import create_default_location
from data.organisation import create_default_organisation
from data.product import create_default_product
from data.product_category import create_default_product_category
from data.product_gender import create_default_product_gender
from data.qr_code import create_default_qr_code, create_qr_code_without_box
from data.size_range import create_default_size_range
from data.transaction import create_default_transaction
from data.user import create_default_users
from data.usergroup import create_default_usergroup
from data.usergroup_access_level import create_default_usergroup_access_level
from data.usergroup_base_access import create_default_usergroup_base_access_list


def setup_tables():
    create_default_bases()
    create_default_beneficiary()
    create_default_box()
    create_default_box_state()
    create_default_location()
    create_default_organisation()
    create_default_qr_code()
    create_qr_code_without_box()
    create_default_users()
    create_default_usergroup()
    create_default_usergroup_access_level()
    create_default_usergroup_base_access_list()
    create_default_product()
    create_default_product_category()
    create_default_product_gender()
    create_default_size_range()
    create_default_transaction()
