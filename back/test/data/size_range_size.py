from boxtribute_server.models.definitions.size_range_size import SizeRangeSize

from .size import another_size_data, default_size_data, mixed_size_data
from .size_range import data as size_range_data


def data():
    size_range_id = size_range_data()[0]["id"]
    return [
        {"size": default_size_data()["id"], "size_range": size_range_id},
        {"size": another_size_data()["id"], "size_range": size_range_id},
        {"size": mixed_size_data()["id"], "size_range": size_range_id},
    ]


def create():
    SizeRangeSize.insert_many(data()).execute()
