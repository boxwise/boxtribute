from .base import Base
from .base_module import BaseModule
from .beneficiary import Beneficiary
from .box import Box
from .box_state import BoxState
from .language import Language
from .location import Location
from .log import Log
from .organisation import Organisation
from .product import Product
from .product_category import ProductCategory
from .product_gender import ProductGender
from .qr_code import QRCode
from .settings import Settings
from .size import Size
from .size_range import SizeRange
from .transaction import Transaction
from .user import User
from .usergroup import Usergroup
from .usergroup_access_level import UsergroupAccessLevel
from .usergroup_base_access import UsergroupBaseAccess

MODELS = (
    Base,
    BaseModule,
    Beneficiary,
    Box,
    BoxState,
    Language,
    Location,
    Log,
    Organisation,
    Product,
    ProductCategory,
    ProductGender,
    QRCode,
    Settings,
    Size,
    SizeRange,
    Transaction,
    User,
    Usergroup,
    UsergroupAccessLevel,
    UsergroupBaseAccess,
)
