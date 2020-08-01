import sys

from peewee import Database, Model, Proxy
from playhouse.db_url import connect as db_url_connect


class DatabaseWrapper(object):
    def __init__(self, app=None, database=None, model_class=Model):
        self.database = None  # Reference to actual Peewee database instance.
        self.base_model_class = model_class
        self._app = app
        self._db = database  # dict, url, Database, or None (default).
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self._app = app
        if self._db is None:
            if "DATABASE" in app.config:
                initial_db = app.config["DATABASE"]
            elif "DATABASE_URL" in app.config:
                initial_db = app.config["DATABASE_URL"]
            else:
                raise ValueError(
                    "Missing required configuration data for "
                    "database: DATABASE or DATABASE_URL."
                )
        else:
            initial_db = self._db

        self._load_database(app, initial_db)
        self._register_handlers(app)

    def _load_database(self, app, config_value):
        if isinstance(config_value, Database):
            database = config_value
        elif isinstance(config_value, dict):
            database = self._load_from_config_dict(dict(config_value))
        else:
            # Assume a database connection URL.
            database = db_url_connect(config_value)

        if isinstance(self.database, Proxy):
            self.database.initialize(database)
        else:
            self.database = database

    def _load_from_config_dict(self, config_dict):
        try:
            name = config_dict.pop("name")
            engine = config_dict.pop("engine")
        except KeyError:
            raise RuntimeError(
                "DATABASE configuration must specify a " "`name` and `engine`."
            )

        if "." in engine:
            path, class_name = engine.rsplit(".", 1)
        else:
            path, class_name = "peewee", engine

        try:
            __import__(path)
            module = sys.modules[path]
            database_class = getattr(module, class_name)
            assert issubclass(database_class, Database)
        except ImportError:
            raise RuntimeError("Unable to import %s" % engine)
        except AttributeError:
            raise RuntimeError("Database engine not found %s" % engine)
        except AssertionError:
            raise RuntimeError(
                "Database engine not a subclass of " "peewee.Database: %s" % engine
            )

        return database_class(name, **config_dict)

    def _register_handlers(self, app):
        app.before_request(self.connect_db)
        app.teardown_request(self.close_db)

    def get_model_class(self):
        if self.database is None:
            raise RuntimeError("Database must be initialized.")

        class BaseModel(self.base_model_class):
            class Meta:
                database = self.database

        return BaseModel

    @property
    def Model(self):
        if self._app is None:
            database = getattr(self, "database", None)
            if database is None:
                self.database = Proxy()

        if not hasattr(self, "_model_class"):
            self._model_class = self.get_model_class()
        return self._model_class

    def connect_db(self):
        self.database.connect(reuse_if_open=True)

    def close_db(self, exc):
        if not self.database.is_closed():
            self.database.close()
