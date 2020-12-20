"""
table_genders_add_foreign_key_camps
date created: 2020-11-27 21:19:34.821372

This migration must be moved into flask/boxwise_flask/migrations to work
"""
from peewee import ForeignKeyField, SQL
from playhouse import migrate
from boxwise_flask.models import base

import logging
logger = logging.getLogger('peewee')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)

# Select either of "sql", "peewee_moves", or "native_peewee"
METHOD = "sql"


def upgrade(migrator):
    """Execute globally specified upgrade function."""
    globals()[f"upgrade_{METHOD}"](migrator)


def downgrade(migrator):
    """Execute globally specified downgrade function."""
    globals()[f"downgrade_{METHOD}"](migrator)


def upgrade_sql(migrator):
    cursor = migrator.execute_sql("ALTER TABLE genders ADD camp_id INT(11) UNSIGNED;")
    cursor.close()
    cursor = migrator.execute_sql("ALTER TABLE genders ADD CONSTRAINT fk_camp_id FOREIGN KEY (camp_id) REFERENCES camps(id);")
    cursor.close()


def downgrade_sql(migrator):
    cursor = migrator.execute_sql("ALTER TABLE genders DROP FOREIGN KEY fk_camp_id;")
    cursor.close()
    cursor = migrator.execute_sql("ALTER TABLE genders DROP COLUMN camp_id")
    cursor.close()


def upgrade_native_peewee(migrator):
    field = ForeignKeyField(
        model=base.Base,
        # if omitted: 'Foreign keys must specify a field'
        # use Field type, not name ("id")
        # otherwise: str object has no attribute column_name
        field=base.Base.id,
        # if omitted: 'camp_id is not null but has no default'
        null=True,
        # Crucial! Otherwise: 'Cannot add foreign key constraint'
        constraints=[SQL("UNSIGNED")],
        # on_delete="CASCADE",
        # on_update="SET NULL",
    )
    # alternative for constraints:
    # https://github.com/coleifer/peewee/issues/542#issuecomment-393831940

    # not relevant
    # migrator.migrator.explicit_create_foreign_key = True

    # effectively runs
    # 'ALTER TABLE `genders` ADD COLUMN `camp_id` INTEGER UNSIGNED'
    # 'ALTER TABLE `genders` ADD CONSTRAINT `fk_genders_camp_id_refs_camps` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`)'
    # 'CREATE INDEX `genders_camp_id` ON `genders` (`camp_id`)'
    operation = migrator.migrator.add_column("genders", "camp_id", field)
    migrate.migrate(operation)  # or operation.run()


def downgrade_native_peewee(migrator):
    # effectively runs
    # 'ALTER TABLE `genders` DROP FOREIGN KEY `fk_genders_camp_id_refs_camps`'
    # 'ALTER TABLE `genders` DROP COLUMN `camp_id` CASCADE'
    migrator.migrator.drop_column("genders", "camp_id").run()


def upgrade_peewee_moves(migrator):
    # raw SQL commands run are identical to those of upgrade_native_peewee()
    migrator.add_column(
        "genders", "camp_id", "foreign_key",
        model=base.Base,
        field=base.Base.id,
        null=True,
        constraints=[SQL("UNSIGNED")],
    )


def downgrade_peewee_moves(migrator):
    # raw SQL commands run are identical to those of downgrade_native_peewee()
    migrator.drop_column("genders", "camp_id")


def upgrade_peewee_moves_ineffective(migrator):
    # with 'safe=False' error: Table exists
    # The adding of the camp_id column is still effective yet peewee-moves marks the migration as not applied!!
    with migrator.create_table("genders", safe=True) as table:
        table.foreign_key("integer", "camp_id", "camps.id")
