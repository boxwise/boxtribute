from faker import Faker, providers
from peewee import fn

from ..auth import CurrentUser
from ..business_logic.beneficiary.crud import (
    create_beneficiary,
    deactivate_beneficiary,
    update_beneficiary,
)
from ..business_logic.box_transfer.agreement.crud import (
    accept_transfer_agreement,
    cancel_transfer_agreement,
    create_transfer_agreement,
    reject_transfer_agreement,
)
from ..business_logic.tag.crud import create_tag, delete_tag, update_tag
from ..business_logic.warehouse.box.crud import create_box, update_box
from ..business_logic.warehouse.location.crud import create_location, delete_location
from ..business_logic.warehouse.product.crud import (
    create_custom_product,
    delete_product,
    edit_custom_product,
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
from ..models.definitions.product import Product
from ..models.definitions.size import Size
from ..models.utils import convert_ids

nr_tags_per_base = 20


class Generator:

    def __init__(self):
        self.fake = Faker()
        Faker.seed(4321)
        self.fake.add_provider(providers.color)
        self.fake.add_provider(providers.date_time)
        self.fake.add_provider(providers.lorem)
        self.fake.add_provider(providers.misc)
        self.fake.add_provider(providers.python)

        self.base_ids = None
        self.user_ids_for_base = None
        self.tags = None
        self.qr_codes = None
        self.products = None
        self.locations = None

    def run(self):
        self._fetch_bases()
        self._fetch_users_for_bases()
        self._generate_tags()
        self._generate_locations()
        self._generate_beneficiaries()
        self._generate_products()
        self._generate_qr_codes()
        self._generate_transfer_agreements()
        self._generate_boxes()
        self._insert_into_database()

    def _fetch_bases(self):
        self.base_ids = [b.id for b in Base.select(Base.id).where(Base.id < 100)]
        self.products = {b: [] for b in self.base_ids}
        self.tags = {b: [] for b in self.base_ids}
        self.locations = {b: [] for b in self.base_ids}

    def _fetch_users_for_bases(self):
        cursor = db.database.execute_sql(
            """\
    SELECT cuc.camp_id, group_concat(u.id ORDER BY u.id) FROM cms_users u
    INNER JOIN cms_usergroups cu
    ON u.cms_usergroups_id = cu.id
    INNER JOIN cms_usergroups_camps cuc
    ON cu.id = cuc.cms_usergroups_id
    AND cuc.camp_id in %s
    GROUP BY cuc.camp_id
    ;""",
            (self.base_ids,),
        )
        result = cursor.fetchall()
        users = {}
        for row in result:
            base_id, user_ids = row
            users[base_id] = [int(i) for i in user_ids.split(",")]
        self.user_ids_for_base = users

    def _generate_tags(self):
        for b in self.base_ids:
            for _ in range(nr_tags_per_base):
                tag = create_tag(
                    name=self.fake.word(),
                    description=self.fake.sentence(nb_words=3),
                    color=self.fake.color(),
                    type=self.fake.enum(TagType),
                    base_id=b,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                self.tags[b].append(tag)

            # Update some tag properties
            length = round(nr_tags_per_base / 2)
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    name=self.fake.word(),
                    id=tag.id,
                    tag=tag,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    description=self.fake.sentence(nb_words=4),
                    id=tag.id,
                    tag=tag,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for tag in self.fake.random_elements(self.tags[b], length=length):
                update_tag(
                    color=self.fake.color(),
                    id=tag.id,
                    tag=tag,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

            # Delete some tags
            length = round(nr_tags_per_base / 10)
            for tag in self.fake.random_elements(
                self.tags[b], length=length, unique=True
            ):
                delete_tag(
                    tag=tag,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                self.tags[b].remove(tag)

    def _generate_locations(self):
        for b in self.base_ids:
            for box_state, name in zip(
                [
                    BoxState.InStock,
                    BoxState.InStock,
                    BoxState.Donated,
                    BoxState.Lost,
                    BoxState.Scrap,
                    BoxState.InStock,
                ],
                ["Stockroom", "WH", "FreeShop", "LOST", "SCRAP", "Unused WH"],
            ):
                location = create_location(
                    name=name,
                    base_id=b,
                    box_state=box_state,
                    is_shop=name == "FreeShop",
                    is_stockroom=name == "Stockroom",
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                self.locations[b].append(location)

            # Delete last location in list
            delete_location(
                location=location,
                user_id=self.fake.random_element(self.user_ids_for_base[b]),
            )
            self.locations[b].remove(location)

    def _generate_beneficiaries(self):
        nr_adults_per_base = 100
        nr_children_per_base = 200

        # Last base does not have beneficiaries registered
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

            for i in range(nr_adults_per_base):
                group_id = self.fake.unique.random_number(digits=4, fix_len=True)
                if i % 2 == 0:
                    first_name = self.fake.first_name_female()
                    gender = HumanGender.Female
                    family_head_id = None
                else:
                    first_name = self.fake.first_name_male()
                    gender = HumanGender.Male
                    if i > nr_adults_per_base / 2:
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
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                beneficiaries.append(beneficiary)

            for i in range(nr_children_per_base):
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
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                beneficiaries.append(beneficiary)

            # Update some beneficiary properties
            length = round(0.5 * len(beneficiaries))
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    registered=True,
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    is_volunteer=not beneficiary.is_volunteer,
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    comment=self.fake.sentence(nb_words=3),
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for beneficiary in self.fake.random_elements(beneficiaries, length=length):
                update_beneficiary(
                    last_name=f"{beneficiary.last_name}er",
                    id=beneficiary.id,
                    beneficiary=beneficiary,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

            # Deactivate 3% of beneficiaries
            for beneficiary in self.fake.random_elements(
                beneficiaries, length=round(0.03 * len(beneficiaries)), unique=True
            ):
                deactivate_beneficiary(beneficiary=beneficiary)

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
        size_ranges = {
            "Underwear": 6,  # Mixed sizes
            "Tights": 6,
            "Socks": 6,
            "Trousers": 1,
            "T-Shirts": 1,
            "Jackets": 1,
        }

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
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self.fake.random_element(self.user_ids_for_base[b]),
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
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self.fake.random_element(self.user_ids_for_base[b]),
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
                        comment=self.fake.sentence(nb_words=3),
                        in_shop=self.fake.boolean(chance_of_getting_true=10),
                        user_id=self.fake.random_element(self.user_ids_for_base[b]),
                    )
                    self.products[b].append(product)

            for name in baby_products:
                product = create_custom_product(
                    category_id=8,
                    size_range_id=22,
                    gender=ProductGender.UnisexBaby,
                    base_id=b,
                    name=name,
                    comment=self.fake.sentence(nb_words=3),
                    in_shop=self.fake.boolean(chance_of_getting_true=10),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
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
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                self.products[b].append(product)

            # Delete a product
            to_be_deleted_product = create_custom_product(
                category_id=12,
                size_range_id=17,
                gender=ProductGender.UnisexKid,
                base_id=b,
                name="Child clothes",
                user_id=self.fake.random_element(self.user_ids_for_base[b]),
            )
            edit_custom_product(
                gender=ProductGender.none,
                id=to_be_deleted_product.id,
                product=to_be_deleted_product,
                user_id=self.fake.random_element(self.user_ids_for_base[b]),
            )
            delete_product(
                product=to_be_deleted_product,
                user_id=self.fake.random_element(self.user_ids_for_base[b]),
            )

            # Update some product properties
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    name=product.name.lower(),
                    id=product.id,
                    product=product,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    price=self.fake.random_int(max=100),
                    id=product.id,
                    product=product,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    comment=self.fake.sentence(nb_words=2),
                    id=product.id,
                    product=product,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for product in self.fake.random_elements(self.products[b]):
                edit_custom_product(
                    in_shop=not product.in_shop,
                    id=product.id,
                    product=product,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

    def _generate_qr_codes(self):
        user_ids = [i for ids in self.user_ids_for_base.values() for i in ids]
        qr_codes = []
        for _ in range(500):
            qr_code = create_qr_code(user_id=self.fake.random_element(user_ids))
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
            partner_organisation_base_ids=[2],
            user=org1_user,
        )
        accept_transfer_agreement(agreement=agreement, user=org2_user)

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

            for _ in range(100):
                product = self.fake.random_element(self.products[b])
                box = create_box(
                    product_id=product.id,
                    location_id=self.fake.random_element(in_stock_location_ids),
                    size_id=self.fake.random_element(size_ids[product.category_id]),
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
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
                boxes.append(box)

            # Change some box properties
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    location_id=self.fake.random_element(non_in_stock_location_ids),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for box in self.fake.random_elements(boxes, length=50):
                product = self.fake.random_element(self.products[b])
                update_box(
                    label_identifier=box.label_identifier,
                    product_id=product.id,
                    size_id=self.fake.random_element(size_ids[product.category_id]),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    number_of_items=self.fake.random_int(max=999),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )
            for box in self.fake.random_elements(boxes, length=50):
                update_box(
                    label_identifier=box.label_identifier,
                    comment=self.fake.sentence(nb_words=2),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

    def _insert_into_database(self):
        pass
