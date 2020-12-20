"""
table_box_add_color_column
date created: 2020-11-27 21:19:34.821372
"""


def upgrade(migrator):
    migrator.add_column("stock", "color", "char", default="")


def downgrade(migrator):
    migrator.drop_column("stock", "color")
