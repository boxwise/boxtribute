from datetime import date

from boxtribute_server.enums import TaggableObjectType
from boxtribute_server.models.definitions.tags_relation import TagsRelation

from .beneficiary import another_male_beneficiary_data, default_beneficiary_data
from .box import box_without_qr_code_data, default_box_data, in_transit_box_data
from .tag import data as tag_data
from .user import default_user_data


def data():
    return [
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[0]["id"],
            "created_on": date(2022, 1, 1),
            "created_by": default_user_data()["id"],
            "deleted_on": date(2022, 6, 1),
            "deleted_by": default_user_data()["id"],
        },
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[0]["id"],
            "created_on": None,
            "created_by": None,
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": default_box_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[1]["id"],
            "created_on": date(2022, 1, 1),
            "created_by": default_user_data()["id"],
            "deleted_on": date(2022, 6, 1),
            "deleted_by": default_user_data()["id"],
        },
        {
            "object_id": default_box_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[1]["id"],
            "created_on": date(2023, 1, 1),
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[2]["id"],
            "created_on": None,
            "created_by": None,
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": box_without_qr_code_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[2]["id"],
            "created_on": None,
            "created_by": None,
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": default_box_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[2]["id"],
            "created_on": None,
            "created_by": None,
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": in_transit_box_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[2]["id"],
            "created_on": date(2024, 1, 1),
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "deleted_by": None,
        },
        {
            "object_id": another_male_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[0]["id"],
            "created_on": date(2022, 1, 1),
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "deleted_by": None,
        },
    ]


def create():
    TagsRelation.insert_many(data()).execute()
