from peewee import AutoField, Metadata
from peewee import Model as PeeweeModel


class Model(PeeweeModel):
    # Peewee adds a primary-key field "id" by default which is not visible for static
    # analysis tools. Hence define a stub property to avoid mypy warnings when using
    # e.g. `Base.id`. At runtime, peewee will override this with the real "id" field
    id: AutoField
    # Same for the _meta field which is added in the ModelBase class
    _meta: Metadata
