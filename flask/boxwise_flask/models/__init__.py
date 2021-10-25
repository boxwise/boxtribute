from .base import Base
from .base_module import BaseModule
from .beneficiary import Beneficiary
from .box import Box
from .box_state import BoxState
from .history import DbChangeHistory
from .language import Language
from .location import Location
from .log import Log
from .organisation import Organisation
from .product import Product
from .product_category import ProductCategory
from .product_gender import ProductGender
from .qr_code import QrCode
from .settings import Settings
from .size import Size
from .size_range import SizeRange
from .transaction import Transaction
from .user import User
from .usergroup import Usergroup
from .usergroup_access_level import UsergroupAccessLevel
from .usergroup_base_access import UsergroupBaseAccess
from .x_beneficiary_language import XBeneficiaryLanguage

MODELS = (
    Base,
    BaseModule,
    Beneficiary,
    Box,
    BoxState,
    DbChangeHistory,
    Language,
    Location,
    Log,
    Organisation,
    Product,
    ProductCategory,
    ProductGender,
    QrCode,
    Settings,
    Size,
    SizeRange,
    Transaction,
    User,
    Usergroup,
    UsergroupAccessLevel,
    UsergroupBaseAccess,
    XBeneficiaryLanguage,
)
