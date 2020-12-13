"""
create table developer
date created: 2020-11-27 21:03:19.282704
"""


def upgrade(migrator):
    with migrator.create_table('developer') as table:
        table.primary_key('id')
        table.char('name', max_length=255, null=True)


def downgrade(migrator):
    migrator.drop_table('developer')
