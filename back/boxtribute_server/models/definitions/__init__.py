from peewee import AutoField, Metadata
from peewee import Model as PeeweeModel


class Model(PeeweeModel):
    # Peewee adds a primary-key field "id" by default which is not visible for static
    # analysis tools. Hence define a stub property to avoid mypy warnings when using
    # e.g. `Base.id`. At runtime, peewee will override this with the real "id" field
    id: AutoField
    # Same for the _meta field which is added in the ModelBase class
    _meta: Metadata


def models():
    """List of all data models.
    Cf. https://stackoverflow.com/a/43820902/3865876.
    CRUCIAL: the subclass relationship only becomes apparent once all models derived
    from Model are imported into the current Python context. E.g. the Flask app imports
    from the routes module in main which imports all data models down the way (via
    graph_ql.schema and graph_ql.bindables)
    """
    return Model.__subclasses__()
