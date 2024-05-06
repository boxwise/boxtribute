from faker import Faker, providers

from ..business_logic.tag.crud import create_tag
from ..db import db
from ..enums import TagType
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

    def _insert_into_database(self):
        pass
