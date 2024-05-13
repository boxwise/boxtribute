from faker import Faker, providers

from ..business_logic.beneficiary.crud import create_beneficiary, deactivate_beneficiary
from ..business_logic.tag.crud import create_tag
from ..business_logic.warehouse.location.crud import create_location
from ..business_logic.warehouse.product.crud import create_custom_product
from ..business_logic.warehouse.qr_code.crud import create_qr_code
from ..db import db
from ..enums import BoxState, HumanGender, Language, ProductGender, TagType
from ..models.definitions.base import Base

nr_tags_per_base = 5


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
        self.tags = []

    def run(self):
        self._fetch_bases()
        self._fetch_users_for_bases()
        self._generate_tags()
        self._generate_locations()
        self._generate_beneficiaries()
        self._generate_products()
        self._generate_qr_codes()
        self._insert_into_database()

    def _fetch_bases(self):
        self.base_ids = [b.id for b in Base.select(Base.id).where(Base.id < 100)]

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
                create_tag(
                    name=self.fake.word(),
                    description=self.fake.sentence(nb_words=3),
                    color=self.fake.color(),
                    type=self.fake.enum(TagType),
                    base_id=b,
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

    def _generate_locations(self):
        for b in self.base_ids:
            for box_state, name in zip(
                [
                    BoxState.InStock,
                    BoxState.InStock,
                    BoxState.Donated,
                    BoxState.Lost,
                    BoxState.Scrap,
                ],
                ["Stockroom", "WH", "FreeShop", "LOST", "SCRAP"],
            ):
                create_location(
                    name=name,
                    base_id=b,
                    box_state=box_state,
                    is_shop=name == "FreeShop",
                    is_stockroom=name == "Stockroom",
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

    def _generate_beneficiaries(self):
        nr_adults_per_base = 100
        nr_children_per_base = 200

        # Last base does not have beneficiaries registered
        for b in self.base_ids[:-1]:
            family_head_id = None
            beneficiary = None
            family_heads = []
            beneficiaries = []

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
                        create_custom_product(
                            category_id=category_id,
                            size_range_id=size_range_id,
                            gender=gender,
                            base_id=b,
                            name=name,
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self.fake.random_element(self.user_ids_for_base[b]),
                        )

            for category_id, names in unisex_products.items():
                for name in names:
                    size_range_id = size_ranges.get(name, 7)
                    for gender in unisex_genders:
                        create_custom_product(
                            category_id=category_id,
                            size_range_id=size_range_id,
                            gender=gender,
                            base_id=b,
                            name=name,
                            comment=self.fake.sentence(nb_words=3),
                            in_shop=self.fake.boolean(chance_of_getting_true=10),
                            user_id=self.fake.random_element(self.user_ids_for_base[b]),
                        )

            for category_id, names in nongender_products.items():
                for name in names:
                    create_custom_product(
                        category_id=category_id,
                        size_range_id=7,
                        gender=ProductGender.none,
                        base_id=b,
                        name=name,
                        comment=self.fake.sentence(nb_words=3),
                        in_shop=self.fake.boolean(chance_of_getting_true=10),
                        user_id=self.fake.random_element(self.user_ids_for_base[b]),
                    )

            for name in baby_products:
                create_custom_product(
                    category_id=8,
                    size_range_id=22,
                    gender=ProductGender.UnisexBaby,
                    base_id=b,
                    name=name,
                    comment=self.fake.sentence(nb_words=3),
                    in_shop=self.fake.boolean(chance_of_getting_true=10),
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

            for gender, size_range_id in zip(
                [ProductGender.Women, ProductGender.Men, ProductGender.UnisexKid],
                [3, 8, 6],
            ):
                create_custom_product(
                    category_id=5,
                    size_range_id=size_range_id,
                    gender=gender,
                    base_id=b,
                    name="Shoes",
                    user_id=self.fake.random_element(self.user_ids_for_base[b]),
                )

    def _generate_qr_codes(self):
        user_ids = [i for ids in self.user_ids_for_base.values() for i in ids]
        for _ in range(400):
            create_qr_code(user_id=self.fake.random_element(user_ids))

    def _insert_into_database(self):
        pass
