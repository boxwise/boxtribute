from pathlib import Path

from ..db import db
from ..utils import in_staging_environment
from .data_faking import Generator

SEED_FILENAME = "init.sql" if in_staging_environment() else "minimal.sql"
SEED_FILEPATH = Path(__file__).parent.resolve().parent.parent / SEED_FILENAME


def reseed_db():
    # For testing locally, run
    # dotenv run flask --debug --app boxtribute_server.dev_main:app run -p 5005
    # curl 'http://localhost:5005/cron/reseed-db' -H 'x-appengine-cron: true'
    with db.database.cursor() as cursor, open(SEED_FILEPATH) as seed:
        execute_sql_statements_from_file(cursor, seed)

    # Seed the staging DB with the large init.sql dump and skip running the fake-data
    # generation because the long runtime causes the connection to the GCloud MySQL
    # server to be interrupted
    if in_staging_environment():
        # The seed contains Auth0 role IDs of the dev tenant which need to be replaced
        update_auth0_role_ids()
        return

    generator = Generator()
    generator.run()


def execute_sql_statements_from_file(cursor, sql_file):
    """Utility to parse a file with SQL statements and execute them one by one.

    Props to https://stackoverflow.com/a/19159041/3865876
    """
    statement = ""

    for line in sql_file.readlines():
        # ignore SQL comment lines (using string methods is way faster than regexes)
        if line.startswith("--"):
            continue

        line = line.strip()
        if not line.endswith(";"):
            # keep appending lines that don't end with semicolon
            statement = statement + line

        else:
            # when you get a line ending with semicolon, then execute statement and
            # reset for next statement
            statement = statement + line
            cursor.execute(statement)
            statement = ""


# Obtained from staging/tenant.yaml in the system-management repo
STAGING_AUTH0_ROLE_IDS = {
    "administrator": "rol_I49URaIyhBnMQHJQ",
    "base_100000000_coordinator": "rol_tcBvcFXhVekggU8H",
    "base_100000000_free_shop_volunteer": "rol_R19NxnEOO3iGctqc",
    "base_100000000_label_creation": "rol_3jwyihkX503dI2XI",
    "base_100000000_library_volunteer": "rol_8tqEAp6v0qmK4SiX",
    "base_100000000_warehouse_volunteer": "rol_7syKQNdCCteg5BDi",
    "base_100000001_coordinator": "rol_Fv2c7Mzh2Njr2pp0",
    "base_100000001_free_shop_volunteer": "rol_76CagkHaSRsHNosv",
    "base_100000001_label_creation": "rol_yqMsT3EmaLymy8ez",
    "base_100000001_library_volunteer": "rol_9qyfKtUXKZap8ngz",
    "base_100000001_warehouse_volunteer": "rol_17GcfmcO6kQ94zYZ",
    "base_100000017_coordinator": "rol_xuMG7Li42Xz7XpCV",
    "base_100000017_free_shop_volunteer": "rol_tOTX1v7iOBKUMfnM",
    "base_100000017_label_creation": "rol_MZ0MiesxFjmIm04P",
    "base_100000017_warehouse_volunteer": "rol_KeYNpBy9k6cSo71K",
    "base_100000018_coordinator": "rol_5QasHvRyGZx59iy0",
    "base_100000018_free_shop_volunteer": "rol_X9wy1vsX2nKfGDQt",
    "base_100000018_label_creation": "rol_aAjBx1YQ0wNg9hN0",
    "base_100000018_warehouse_volunteer": "rol_zC5f75TCqbe3ISQp",
    "base_100000019_coordinator": "rol_q3RdG5xWUPvoWI16",
    "base_100000019_free_shop_volunteer": "rol_dXn6QzgnvEJoylfx",
    "base_100000019_label_creation": "rol_4CAYx4Wv8SkUB43g",
    "base_100000019_warehouse_volunteer": "rol_BwkN2HdfXwPK85W3",
    "base_100000020_coordinator": "rol_4ymABrJtT4R6BL7G",
    "base_100000020_free_shop_volunteer": "rol_XLQbOQdbm2mac5xG",
    "base_100000020_label_creation": "rol_cZJimotAQQ4hmMvW",
    "base_100000020_warehouse_volunteer": "rol_PosBD6y4VciHgFDc",
    "base_1_coordinator": "rol_V4nNNkYco84WlMRT",
    "base_1_free_shop_volunteer": "rol_cUiwTC7Hjda6ZRt0",
    "base_1_label_creation": "rol_rH3ypspbLKPpv5Hv",
    "base_1_library_volunteer": "rol_Gn1K628NdOCHqwOV",
    "base_1_warehouse_volunteer": "rol_zF0wNUwB8gFbGrVJ",
    "base_2_coordinator": "rol_5xjOjvRSch83q8RV",
    "base_2_free_shop_volunteer": "rol_GPN3nIYLVgKfRG8M",
    "base_2_label_creation": "rol_JQgq1dTehqfmWOnm",
    "base_2_library_volunteer": "rol_Odg5F3mr7L9jtsxA",
    "base_2_warehouse_volunteer": "rol_0QGJMfQZEIhw52H9",
    "base_3_coordinator": "rol_uW12dtjMiwyHvE7A",
    "base_3_free_shop_volunteer": "rol_XxJvcFSHa3As9xs5",
    "base_3_label_creation": "rol_zRCKpXBedneXHxlb",
    "base_3_library_volunteer": "rol_MvRbNPaust2tvLMz",
    "base_3_warehouse_volunteer": "rol_cxgyk1fs8zocqJYM",
    "base_4_coordinator": "rol_9R5O6UJiGJpuTGD5",
    "base_4_free_shop_volunteer": "rol_vxlRm59SSUuETdrC",
    "base_4_label_creation": "rol_X2TyZ4GHxjukAAQk",
    "base_4_warehouse_volunteer": "rol_RUqIRfh5nKTFme9z",
    "boxtribute_god": "rol_4qH3g8SAxZf8JRdW",
}


def update_auth0_role_ids():
    nr_roles = len(STAGING_AUTH0_ROLE_IDS)
    when_then_statements = nr_roles * "WHEN %s THEN %s "
    command = f"""\
UPDATE cms_usergroups_roles
SET auth0_role_id =
    CASE auth0_role_name
        {when_then_statements}
    END
; """
    db.database.execute_sql(
        command,
        # convert mapping of role names and IDs into flat list
        [item for role_info in STAGING_AUTH0_ROLE_IDS.items() for item in role_info],
    )
