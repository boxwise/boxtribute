from datetime import datetime, timedelta

from faker import Faker, providers
from flask import g
from freezegun import freeze_time
from peewee import fn

from ..auth import CurrentUser
from ..business_logic.beneficiary.crud import (
    create_beneficiary,
    create_transaction,
    deactivate_beneficiary,
    update_beneficiary,
)
from ..business_logic.box_transfer.agreement.crud import (
    accept_transfer_agreement,
    cancel_transfer_agreement,
    create_transfer_agreement,
    reject_transfer_agreement,
)
from ..business_logic.box_transfer.shipment.crud import (
    _retrieve_shipment_details,
    cancel_shipment,
    create_shipment,
    mark_shipment_as_lost,
    send_shipment,
    start_receiving_shipment,
    update_shipment_when_preparing,
    update_shipment_when_receiving,
)
from ..business_logic.tag.crud import create_tag, delete_tag, update_tag
from ..business_logic.warehouse.box.crud import (
    create_box,
    is_measure_product,
    update_box,
)
from ..business_logic.warehouse.location.crud import create_location, delete_location
from ..business_logic.warehouse.product.crud import (
    create_custom_product,
    delete_product,
    disable_standard_product,
    edit_custom_product,
    edit_standard_product_instantiation,
    enable_standard_product,
)
from ..business_logic.warehouse.qr_code.crud import create_qr_code
from ..db import db
from ..enums import (
    BoxState,
    HumanGender,
    Language,
    ProductGender,
    TagType,
    TransferAgreementType,
)
from ..models.definitions.base import Base
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.qr_code import QrCode
from ..models.definitions.size import Size
from ..models.definitions.standard_product import StandardProduct
from ..models.definitions.tag import Tag
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.definitions.unit import Unit
from ..models.utils import convert_ids

NR_BASES = 4
NR_OF_CREATED_TAGS_PER_BASE = 20
NR_OF_DELETED_TAGS_PER_BASE = round(NR_OF_CREATED_TAGS_PER_BASE / 10)
LOCATION_BOX_STATES = [
    BoxState.InStock,
    BoxState.InStock,
    BoxState.InStock,
    BoxState.Donated,
    BoxState.Donated,
    BoxState.InStock,
]
LOCATION_NAMES = ("Stockroom", "WH", "WH2", "FreeShop", "Donated location", "Unused WH")
NR_OF_CREATED_LOCATIONS_PER_BASE = len(LOCATION_NAMES)
NR_OF_ADULTS_PER_LARGE_BASE = 100
NR_OF_CHILDREN_PER_LARGE_BASE = 200
NR_OF_BENEFICIARIES_PER_LARGE_BASE = (
    NR_OF_ADULTS_PER_LARGE_BASE + NR_OF_CHILDREN_PER_LARGE_BASE
)
NR_OF_ADULTS_PER_SMALL_BASE = 40
NR_OF_CHILDREN_PER_SMALL_BASE = 40
NR_OF_BENEFICIARIES_PER_SMALL_BASE = (
    NR_OF_ADULTS_PER_SMALL_BASE + NR_OF_CHILDREN_PER_SMALL_BASE
)
NR_OF_BOXES_PER_BASE = 100
NR_OF_BOXES_PER_LARGE_BASE = 500
NR_OF_QR_CODES = (NR_BASES - 1) * NR_OF_BOXES_PER_BASE + NR_OF_BOXES_PER_LARGE_BASE + 99


class Generator:
    """Fake data generator build on top of a minimal database dump.
    It is attempted to generate realistic data by using the CRUD functions for the
    models
    - Tag
    - Location
    - Product
    - Beneficiary incl. TagsRelation
    - QrCode
    - Box incl. TagsRelation
    - Transaction
    - TransferAgreement incl. TransferAgreementDetail
    - Shipment incl. ShipmentDetail
    This includes inserts to the history table for any creation, update, or deletion.

    The dump must contain sensible data for the tables:
    - box_state
    - genders
    - languages
    - product_categories
    - sizegroup
    - sizes
    - organisations
    - camps
    - cms_*
    """

    def __init__(self):
        """Set up the Faker instance with a fixed seed for reproducible random
        generation. Set up class attributes for storing of data required across
        generation methods (e.g. products and locations are required when generating
        boxes).
        """
        self.fake = Faker()
        Faker.seed(4321)
        self.fake.add_provider(providers.color)
        self.fake.add_provider(providers.date_time)
        self.fake.add_provider(providers.lorem)
        self.fake.add_provider(providers.misc)
        self.fake.add_provider(providers.python)

        self.base_ids = None
        self.qr_codes = None
        self.accepted_agreement = None
        # The following attributes map a base ID to a list of model instances
        self.users = {}
        self.tags = None
        self.products = None
        self.locations = None
        self.boxes = None
        self.beneficiaries = None

    def run(self):
        """Main method: after obtaining base and user data run all generation methods,
        starting with independent ones.
        """
        self._fetch_bases_and_users()

        # Some intervals (use "uneven" numbers for generating realistic timestamps)
        about_one_hour = 3599
        about_two_hours = 7199
        about_ten_hours = 36_012
        about_ten_days = 863_987

        # Start date for data generation, relative to current time. The number of weeks
        # is chosen such that eventually the newest changes don't happen in the future
        start = datetime.now() - timedelta(weeks=75)

        with freeze_time(start, auto_tick_seconds=about_two_hours + 2):
            self._generate_qr_codes()
        with freeze_time(start, auto_tick_seconds=about_two_hours):
            self._generate_tags()
        with freeze_time(start, auto_tick_seconds=about_ten_hours):
            self._generate_locations()
        with freeze_time(start, auto_tick_seconds=about_one_hour):
            self._generate_beneficiaries()
        with freeze_time(start, auto_tick_seconds=about_one_hour + 2):
            self._generate_products()
        with freeze_time(start, auto_tick_seconds=about_ten_days):
            self._generate_transfer_agreements()

        def _max_value(*fields):
            return max([field.model.select(fn.MAX(field)).scalar() for field in fields])

        # These methods require data generated by the previous ones
        newest_resource_modified_on = _max_value(
            QrCode.created_on,
            Tag.created,
            Tag.last_modified_on,
            Product.created_on,
            Product.last_modified_on,
            Location.created_on,
        )
        with freeze_time(newest_resource_modified_on, auto_tick_seconds=about_one_hour):
            self._generate_boxes()

        newest_resource_modified_on = _max_value(
            Box.created_on,
            Box.last_modified_on,
            Tag.created,
            Tag.last_modified_on,
            Beneficiary.created_on,
        )
        with freeze_time(newest_resource_modified_on, auto_tick_seconds=about_one_hour):
            self._delete_tags()

        newest_resource_modified_on = _max_value(
            Box.created_on,
            Box.last_modified_on,
            TransferAgreement.requested_on,
            TransferAgreement.accepted_on,
        )
        with freeze_time(newest_resource_modified_on, auto_tick_seconds=about_one_hour):
            self._generate_shipments()

        newest_resource_modified_on = _max_value(
            Beneficiary.created_on,
            Product.created_on,
            Product.last_modified_on,
        )
        with freeze_time(newest_resource_modified_on, auto_tick_seconds=about_one_hour):
            self._generate_transactions()

    def _fetch_bases_and_users(self):
        """Obtain relevant test bases (exclude the ones used for Cypress tests), as well
        as test users.
        """
        bases = list(Base.select().where(Base.id < 100))
        self.base_ids = [b.id for b in bases]
        self.products = {b: [] for b in self.base_ids}
        self.tags = {b: [] for b in self.base_ids}
        self.locations = {b: [] for b in self.base_ids}
        self.boxes = {b: [] for b in self.base_ids}
        self.beneficiaries = {b: [] for b in self.base_ids}

        org_ids = {b.id: b.organisation_id for b in bases}

        cursor = db.database.execute_sql(
            """\
    SELECT cuc.camp_id, group_concat(u.id ORDER BY u.id) FROM cms_users u
    INNER JOIN cms_usergroups_camps cuc
    ON u.cms_usergroups_id = cuc.cms_usergroups_id
    AND cuc.camp_id in %s
    GROUP BY cuc.camp_id
    ;""",
            (self.base_ids,),
        )
        result = cursor.fetchall()
        for row in result:
            base_id, user_ids = row
            self.users[base_id] = [
                CurrentUser(
                    id=int(i),
                    organisation_id=org_ids[base_id],
                    timezone=self.fake.timezone(),
                )
                for i in user_ids.split(",")
            ]

    def _user_id(self, base_id):
        """Return the ID of a random user in the base with specified ID. Patch the
        global `g.user` to make the functions in `models/utils.py` work.
        This method should be used anytime a CRUD function requires a user ID.
        """
        user = self.fake.random_element(self.users[base_id])
        g.user = user
        return user.id

    def _generate_tags(self):
        for b in self.base_ids:
            for _ in range(NR_OF_CREATED_TAGS_PER_BASE):
                tag = create_tag(
                    name=self.fake.word(),
                    description=self.fake.sentence(nb_words=3),
                    color=self.fake.color(),
                    type=self.fake.enum(TagType),
                    base_id=b,
                    user_id=self._user_id(b),
                )
                self.tags[b].append(tag)

            # Update some tag properties
            length = round(NR_OF_CREATED_TAGS_PER_BASE / 2)
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    name=self.fake.word(),
                    id=tag.id,
                    tag=tag,
                    user_id=self._user_id(b),
                )
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    description=self.fake.sentence(nb_words=4),
                    id=tag.id,
                    tag=tag,
                    user_id=self._user_id(b),
                )
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    color=self.fake.color(),
                    id=tag.id,
                    tag=tag,
                    user_id=self._user_id(b),
                )

    def _delete_tags(self):
        for b in self.base_ids:
            for tag in self.fake.random_elements(
                self.tags[b], length=NR_OF_DELETED_TAGS_PER_BASE, unique=True
            ):
                delete_tag(
                    tag=tag,
                    user_id=self._user_id(b),
                )
                self.tags[b].remove(tag)

    def _generate_locations(self):
        for b in self.base_ids:
            for box_state, name in zip(LOCATION_BOX_STATES, LOCATION_NAMES):
                location = create_location(
                    name=name,
                    base_id=b,
                    box_state=box_state,
                    is_shop=name == "FreeShop",
                    is_stockroom=name == "Stockroom",
                    user_id=self._user_id(b),
                )
                self.locations[b].append(location)

            # Delete last location in list
            delete_location(
                location=location,
                user_id=self._user_id(b),
            )
            self.locations[b].remove(location)

    def _generate_beneficiaries(self):
        # Last base does not have beneficiaries registered. First base has lots of
        # beneficiaries registered
        for b in self.base_ids[:-1]:
            family_head_id = None
            beneficiary = None
            family_heads = []
            beneficiaries = []
            beneficiary_tag_ids = [
                tag.id
                for tag in self.tags[b]
                if tag.type in [TagType.Beneficiary, TagType.All]
            ]

            nr_of_adults_per_base = NR_OF_ADULTS_PER_SMALL_BASE
            nr_of_children_per_base = NR_OF_CHILDREN_PER_SMALL_BASE
            if b == 1:
                nr_of_adults_per_base = NR_OF_ADULTS_PER_LARGE_BASE
                nr_of_children_per_base = NR_OF_CHILDREN_PER_LARGE_BASE

            for i in range(nr_of_adults_per_base):
                group_id = self.fake.unique.random_number(digits=4, fix_len=True)
                if i % 2 == 0:
                    first_name = self.fake.first_name_female()
                    gender = HumanGender.Female
                    family_head_id = None
                else:
                    first_name = self.fake.first_name_male()
                    gender = HumanGender.Male
                    if i > nr_of_adults_per_base / 2:
                        # Some beneficiaries are part of a family
                        family_head_id = beneficiary.id
                        group_id = beneficiary.group_identifier
                        family_heads.append(beneficiary)

                beneficiary = create_beneficiary(
                    first_name=first_name,
                    last_name=self.fake.last_name(),
                    base_id=b,
                    group_identifier=group_id,
                    date_of_birth=self.fake.date_of_birth(minimum_age=30),
                    gender=gender,
                    family_head_id=family_head_id,
                    is_volunteer=self.fake.boolean(),
                    registered=self.fake.boolean(),
                    comment=self.fake.sentence(nb_words=3),
                    # Some beneficiaries don't have any language assigned
                    languages=self.fake.random_elements(
                        [lg.value for lg in Language], length=3, unique=True
                    )[:-1],
                    # Assign at most 3 tags to half of the adult beneficiaries
                    tag_ids=(
                        self.fake.random_elements(
                            beneficiary_tag_ids,
                            unique=True,
                            length=self.fake.random_int(min=1, max=3),
                        )
                        if self.fake.boolean()
                        else None
                    ),
                    user_id=self._user_id(b),
                )
                beneficiaries.append(beneficiary)

            for i in range(nr_of_children_per_base):
                if i % 2 == 0:
                    first_name = self.fake.first_name_female()
                    gender = HumanGender.Female
                else:
                    first_name = self.fake.first_name_male()
                    gender = HumanGender.Male

                parent = self.fake.random_element(family_heads)
                beneficiary = create_beneficiary(
                    first_name=first_name,
                    last_name=parent.last_name,
                    base_id=b,
                    group_identifier=parent.group_identifier,
                    date_of_birth=self.fake.date_of_birth(maximum_age=15),
                    gender=gender,
                    family_head_id=parent.id,
                    is_volunteer=False,
                    registered=self.fake.boolean(),
                    user_id=self._user_id(b),
                )
                beneficiaries.append(beneficiary)

            # Update some beneficiary properties
            length = round(0.5 * len(beneficiaries))
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    registered=True,
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self._user_id(b),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    is_volunteer=not beneficiary.is_volunteer,
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self._user_id(b),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    comment=self.fake.sentence(nb_words=3),
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self._user_id(b),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    last_name=f"{beneficiary.last_name}er",
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self._user_id(b),
                )

            # Deactivate 3% of beneficiaries
            for beneficiary in self.fake.random_elements(
                beneficiaries, length=round(0.03 * len(beneficiaries)), unique=True
            ):
                deactivate_beneficiary(beneficiary=beneficiary)

            self.beneficiaries[b] = beneficiaries

    def _generate_products(self):
        gendered_products = {
            1: ["Underwear", "Tights"],
            2: ["Trousers"],
            3: ["T-Shirts"],
            6: ["Jackets"],
            12: ["Swimwear", "Gloves"],
        }
        unisex_products = {
            1: ["Socks", "Hats"],
            12: ["Belts"],
        }
        nongender_products = {
            4: ["Umbrellas", "Pillows"],
            9: ["Towels", "Toys"],
            10: ["Soap", "Deodorant"],
            11: ["Food"],
            13: ["Tents", "Candles"],
            15: ["Inhalation device"],
        }
        baby_products = ["Shirts", "Jackets", "Trousers"]  # category 8
        mass_measure_products = ["Rice", "Pasta", "Chickpeas", "Sugar", "Cereal"]
        volume_measure_products = ["Sauce", "Milk", "Vegetable oil"]
        size_ranges = {
            "Underwear": 6,  # Mixed sizes
            "Tights": 6,
            "Socks": 6,
            "Trousers": 1,
            "T-Shirts": 1,
            "Jackets": 1,
        }
        standard_products = list(StandardProduct.select())
        enabled_standard_products = {b: [] for b in self.base_ids}

        genders = [
            ProductGender.Women,
            ProductGender.Men,
            ProductGender.Girl,
            ProductGender.Boy,
        ]
        unisex_genders = [ProductGender.UnisexAdult, ProductGender.UnisexKid]

        for b in self.base_ids:
            for category_id, names in gendered_products.items():
                for name in names:
                    # Fall back to One-size size range
                    size_range_id = size_ranges.get(name, 7)
                    for gender in genders:
                        product = create_custom_product(
                            category_id=category_id,
                            size_range_id=size_range_id,
                            gender=gender,
                            base_id=b,
                            name=name,
                            price=self.fake.random_int(max=100),
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self._user_id(b),
                        )
                        self.products[b].append(product)

            for category_id, names in unisex_products.items():
                for name in names:
                    size_range_id = size_ranges.get(name, 7)
                    for gender in unisex_genders:
                        product = create_custom_product(
                            category_id=category_id,
                            size_range_id=size_range_id,
                            gender=gender,
                            base_id=b,
                            name=name,
                            price=self.fake.random_int(max=100),
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self._user_id(b),
                        )
                        self.products[b].append(product)

            for category_id, names in nongender_products.items():
                for name in names:
                    product = create_custom_product(
                        category_id=category_id,
                        size_range_id=7,
                        gender=ProductGender.none,
                        base_id=b,
                        name=name,
                        price=self.fake.random_int(max=100),
                        comment=self.fake.sentence(nb_words=3),
                        in_shop=self.fake.boolean(chance_of_getting_true=10),
                        user_id=self._user_id(b),
                    )
                    self.products[b].append(product)

            for name in baby_products:
                product = create_custom_product(
                    category_id=8,
                    size_range_id=22,
                    gender=ProductGender.UnisexBaby,
                    base_id=b,
                    name=name,
                    price=self.fake.random_int(max=100),
                    comment=self.fake.sentence(nb_words=3),
                    in_shop=self.fake.boolean(chance_of_getting_true=10),
                    user_id=self._user_id(b),
                )
                self.products[b].append(product)

            for gender, size_range_id in zip(
                [ProductGender.Women, ProductGender.Men, ProductGender.UnisexKid],
                [3, 8, 6],
            ):
                product = create_custom_product(
                    category_id=5,
                    size_range_id=size_range_id,
                    gender=gender,
                    base_id=b,
                    name="Shoes",
                    price=self.fake.random_int(max=100),
                    user_id=self._user_id(b),
                )
                self.products[b].append(product)

            for standard_product in self.fake.random_elements(
                standard_products, unique=True, length=25
            ):
                product = enable_standard_product(
                    standard_product_id=standard_product.id,
                    base_id=b,
                    user_id=self._user_id(b),
                )
                enabled_standard_products[b].append(product)

            for names, size_range_id in zip(
                [mass_measure_products, volume_measure_products], [28, 29]
            ):
                for name in names:
                    product = create_custom_product(
                        category_id=11,
                        size_range_id=size_range_id,
                        gender=ProductGender.none,
                        base_id=b,
                        name=name,
                        price=self.fake.random_int(max=100),
                        user_id=self._user_id(b),
                    )
                    self.products[b].append(product)
            # Delete a product
            to_be_deleted_product = create_custom_product(
                category_id=12,
                size_range_id=17,
                gender=ProductGender.UnisexKid,
                base_id=b,
                name="Child clothes",
                user_id=self._user_id(b),
            )
            edit_custom_product(
                gender=ProductGender.none,
                id=to_be_deleted_product.id,
                product=to_be_deleted_product,
                user_id=self._user_id(b),
            )
            delete_product(
                product=to_be_deleted_product,
                user_id=self._user_id(b),
            )

            # Update some product properties
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    name=product.name.lower(),
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    price=self.fake.random_int(max=100),
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    comment=self.fake.sentence(nb_words=2),
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    in_shop=not product.in_shop,
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )
            for product in self.fake.random_elements(enabled_standard_products[b]):
                edit_standard_product_instantiation(
                    price=self.fake.random_int(max=100),
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )
            for product in self.fake.random_elements(enabled_standard_products[b]):
                edit_standard_product_instantiation(
                    comment=self.fake.sentence(nb_words=2),
                    id=product.id,
                    product=product,
                    user_id=self._user_id(b),
                )

            # Disable some standard products
            for product in self.fake.random_elements(
                enabled_standard_products[b], unique=True, length=5
            ):
                disable_standard_product(product=product, user_id=self._user_id(b))
                enabled_standard_products[b].remove(product)

            self.products[b].extend(enabled_standard_products[b])

    def _generate_qr_codes(self):
        users = [user for users in self.users.values() for user in users]
        qr_codes = []
        for _ in range(NR_OF_QR_CODES):
            user = self.fake.random_element(users)
            g.user = user
            qr_code = create_qr_code(user_id=user.id)
            qr_codes.append(qr_code)
        self.qr_codes = tuple(qr_codes)

    def _generate_transfer_agreements(self):
        org1_user = CurrentUser(
            id=2, organisation_id=1, base_ids=[1], timezone="Europe/Rome"
        )
        org2_user = CurrentUser(
            id=10, organisation_id=2, base_ids=[2, 3, 4], timezone="Europe/Athens"
        )

        # Rejected agreement
        agreement = create_transfer_agreement(
            initiating_organisation_id=1,
            partner_organisation_id=2,
            type=TransferAgreementType.Bidirectional,
            initiating_organisation_base_ids=[1],
            user=org1_user,
        )
        reject_transfer_agreement(agreement=agreement, user=org2_user)

        # Canceled agreement
        agreement = create_transfer_agreement(
            initiating_organisation_id=2,
            partner_organisation_id=1,
            type=TransferAgreementType.Bidirectional,
            initiating_organisation_base_ids=[2, 4],
            user=org2_user,
        )
        accept_transfer_agreement(agreement=agreement, user=org1_user)
        cancel_transfer_agreement(agreement=agreement, user=org1_user)

        # Accepted agreement
        agreement = create_transfer_agreement(
            initiating_organisation_id=1,
            partner_organisation_id=2,
            type=TransferAgreementType.Bidirectional,
            initiating_organisation_base_ids=[1],
            partner_organisation_base_ids=[2, 3],
            user=org1_user,
        )
        accept_transfer_agreement(agreement=agreement, user=org2_user)
        self.accepted_agreement = agreement

        # UnderReview agreement
        agreement = create_transfer_agreement(
            initiating_organisation_id=2,
            partner_organisation_id=1,
            type=TransferAgreementType.Bidirectional,
            initiating_organisation_base_ids=[2, 3, 4],
            user=org2_user,
        )

    def _generate_boxes(self):
        # Sizes for each product category's size range
        result = (
            Size.select(
                Product.category,
                fn.GROUP_CONCAT(Size.id).python_value(convert_ids).alias("size_ids"),
            )
            .join(
                Product,
                on=(Product.size_range == Size.size_range),
            )
            .group_by(Product.category)
            .namedtuples()
        )
        size_ids = {row.category: row.size_ids for row in result}

        # Units for mass and volume dimension
        unit_ids = {
            row.dimension: row.unit_ids
            for row in Unit.select(
                Unit.dimension,
                fn.GROUP_CONCAT(Unit.id).python_value(convert_ids).alias("unit_ids"),
            )
            .where(Unit.dimension << [28, 29])
            .group_by(Unit.dimension)
            .namedtuples()
        }

        for b in self.base_ids:
            box_tag_ids = [
                tag.id for tag in self.tags[b] if tag.type in [TagType.Box, TagType.All]
            ]
            in_stock_location_ids = [
                loc.id
                for loc in self.locations[b]
                if loc.box_state_id == BoxState.InStock
            ]
            non_in_stock_location_ids = [
                loc.id
                for loc in self.locations[b]
                if loc.box_state_id != BoxState.InStock
            ]
            boxes = []

            nr_of_boxes = NR_OF_BOXES_PER_LARGE_BASE if b == 1 else NR_OF_BOXES_PER_BASE
            for _ in range(nr_of_boxes):
                product = self.fake.random_element(self.products[b])

                if is_measure_product(product):
                    size_id = None
                    display_unit_id = self.fake.random_element(
                        unit_ids[product.size_range_id]
                    )
                    measure_value = 100 * self.fake.random_int(max=20)
                else:
                    size_id = self.fake.random_element(size_ids[product.category_id])
                    display_unit_id = None
                    measure_value = None

                box = create_box(
                    product_id=product.id,
                    location_id=self.fake.random_element(in_stock_location_ids),
                    size_id=size_id,
                    display_unit_id=display_unit_id,
                    measure_value=measure_value,
                    number_of_items=self.fake.random_int(max=999),
                    comment=(
                        self.fake.sentence(nb_words=3) if self.fake.boolean(20) else ""
                    ),
                    # Assign unique QR code to box
                    qr_code=self.fake.unique.random_element(self.qr_codes).code,
                    # Assign at most 3 tags to half of the boxes
                    tag_ids=(
                        self.fake.random_elements(
                            box_tag_ids,
                            unique=True,
                            length=self.fake.random_int(min=1, max=3),
                        )
                        if self.fake.boolean()
                        else None
                    ),
                    user_id=self._user_id(b),
                )
                boxes.append(box)

            # Change some box properties
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    location_id=self.fake.random_element(non_in_stock_location_ids),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=50):
                product = self.fake.random_element(self.products[b])
                if is_measure_product(product) or box.size_id is None:
                    # New product is measure product; or box contains measure product,
                    # hence changing size would be invalid
                    continue
                update_box(
                    label_identifier=box.label_identifier,
                    product_id=product.id,
                    size_id=self.fake.random_element(size_ids[product.category_id]),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    number_of_items=self.fake.random_int(max=999),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=50):
                if box.size_id is not None:
                    # Box contains size product; changing measure value would be invalid
                    continue
                update_box(
                    label_identifier=box.label_identifier,
                    measure_value=100 * self.fake.random_int(max=20),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    comment=self.fake.sentence(nb_words=2),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=25):
                update_box(
                    label_identifier=box.label_identifier,
                    tag_ids=self.fake.random_sample(box_tag_ids, length=2),
                    user_id=self._user_id(b),
                )
            for box in self.fake.random_elements(boxes, length=25):
                update_box(
                    label_identifier=box.label_identifier,
                    tag_ids_to_be_added=[self.fake.random_element(box_tag_ids)],
                    user_id=self._user_id(b),
                )

            self.boxes[b] = boxes

    def _generate_shipments(self):
        org1_user = CurrentUser(
            id=2, organisation_id=1, base_ids=[1], timezone="Europe/Rome"
        )
        org2_user = CurrentUser(
            id=10, organisation_id=2, base_ids=[2, 3, 4], timezone="Europe/Athens"
        )

        def _prepare_shipment(source_base_id, target_base_id):
            user = org1_user if source_base_id == 1 else org2_user
            shipment = create_shipment(
                source_base_id=source_base_id,
                target_base_id=target_base_id,
                transfer_agreement_id=self.accepted_agreement.id,
                user=user,
            )
            nr_prepared_boxes = 10
            prepared_boxes = self.fake.random_elements(
                [
                    box
                    for box in self.boxes[source_base_id]
                    if box.state_id == BoxState.InStock
                ],
                unique=True,
                length=nr_prepared_boxes,
            )
            box_label_identifiers = [b.label_identifier for b in prepared_boxes]
            update_shipment_when_preparing(
                shipment=shipment,
                prepared_box_label_identifiers=box_label_identifiers,
                user=user,
            )
            return shipment, prepared_boxes

        # Shipment 1 -> 2. Prepared, sent, and fully received (Completed)
        source_base_id = 1
        target_base_id = 2
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)
        prepared_box_label_identifiers = [b.label_identifier for b in prepared_boxes]
        removed_box_label_identifiers = prepared_box_label_identifiers[-3:]
        lost_box_label_identifiers = prepared_box_label_identifiers[:3]
        update_shipment_when_preparing(
            shipment=shipment,
            removed_box_label_identifiers=removed_box_label_identifiers,
            user=org1_user,
        )
        send_shipment(shipment=shipment, user=org1_user)

        start_receiving_shipment(shipment=shipment, user=org2_user)
        update_inputs = []
        target_location_ids = [
            loc.id
            for loc in self.locations[target_base_id]
            if loc.box_state_id == BoxState.InStock
        ]
        details = _retrieve_shipment_details(
            shipment.id, Box.state == BoxState.Receiving
        )
        product_matching = {}
        for source_product in self.products[source_base_id]:
            for target_product in self.products[target_base_id]:
                if (
                    source_product.name.lower() == target_product.name.lower()
                    and source_product.gender_id == target_product.gender_id
                ):
                    product_matching[source_product.id] = target_product
                    break

        for detail in details:
            assert detail.box in prepared_boxes, detail.box.label_identifier

            try:
                target_product = product_matching[detail.box.product_id]
            except KeyError:
                # If the box contains a standard product that's not enabled in the
                # target base, assign a random custom product of the target base
                target_product = self.fake.random_element(self.products[target_base_id])

            update_inputs.append(
                {
                    "id": detail.id,
                    "target_product_id": target_product.id,
                    "target_location_id": self.fake.random_element(target_location_ids),
                    "target_size_id": detail.box.size_id,
                    "target_quantity": detail.box.number_of_items,
                },
            )
            self.boxes[source_base_id].remove(detail.box)
            self.boxes[target_base_id].append(detail.box)
        update_shipment_when_receiving(
            shipment=shipment,
            received_shipment_detail_update_inputs=update_inputs,
            lost_box_label_identifiers=lost_box_label_identifiers,
            user=org2_user,
        )

        # Another Shipment 1 -> 2. Prepared, then canceled
        source_base_id = 1
        target_base_id = 2
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)
        cancel_shipment(shipment=shipment, user=org1_user)

        # Shipment 2 -> 1. Prepared, sent, eventually marked as Lost
        source_base_id = 2
        target_base_id = 1
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)
        send_shipment(shipment=shipment, user=org2_user)
        mark_shipment_as_lost(shipment=shipment, user=org2_user)

        # Another Shipment 2 -> 1. Prepared, sent, eventually started Receiving
        source_base_id = 2
        target_base_id = 1
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)
        send_shipment(shipment=shipment, user=org2_user)
        start_receiving_shipment(shipment=shipment, user=org2_user)

        # Shipment 3 -> 1. Preparing
        source_base_id = 3
        target_base_id = 1
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)

        # Another Shipment 3 -> 1. Prepared and Sent
        source_base_id = 3
        target_base_id = 1
        shipment, prepared_boxes = _prepare_shipment(source_base_id, target_base_id)
        send_shipment(shipment=shipment, user=org2_user)

    def _generate_transactions(self):
        for b in self.base_ids:
            # Only family heads can perform transactions
            family_heads = [
                bene for bene in self.beneficiaries[b] if bene.family_head_id is None
            ]
            for family_head in family_heads:
                # Add credit
                credit = 1000
                create_transaction(
                    beneficiary_id=family_head.id,
                    tokens=credit,
                    user_id=self._user_id(b),
                )

                # Add at most 4 purchases
                for _ in range(self.fake.random_int(max=4)):
                    count = self.fake.random_int(min=1, max=5)
                    product = self.fake.random_element(self.products[b])
                    tokens = count * product.price
                    if tokens > credit:
                        # Make sure the credit remains positive
                        break
                    create_transaction(
                        beneficiary_id=family_head.id,
                        tokens=-tokens,
                        count=count,
                        product_id=product.id,
                        user_id=self._user_id(b),
                    )
                    credit -= tokens
