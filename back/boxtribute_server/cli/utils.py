import logging


# https://stackoverflow.com/a/6993694/3865876
class Struct:
    def __init__(self, data):
        for name, value in data.items():
            setattr(self, name, self._wrap(value))

    def _wrap(self, value):
        if isinstance(value, (tuple, list, set, frozenset)):
            return type(value)([self._wrap(v) for v in value])
        else:
            return Struct(value) if isinstance(value, dict) else value

    def __repr__(self):
        return "{%s}" % str(
            ", ".join("'%s': %s" % (k, repr(v)) for (k, v) in self.__dict__.items())
        )

    def __getattr__(self, key):
        try:
            return super().__getattr__(key)
        except AttributeError:
            return


def setup_logger(name):
    logger = logging.getLogger(name)
    formatter = logging.Formatter("%(name)s | %(levelname)s | %(message)s")
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
