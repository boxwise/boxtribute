from boxtribute_server.enums import TaggableObjectType
from boxtribute_server.models.definitions.tags_relation import TagsRelation
from data.beneficiary import default_beneficiary_data
from data.box import box_without_qr_code_data, default_box_data
from data.tag import data as tag_data


def data():
    return [
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[0]["id"],
        },
        {
            "object_id": default_box_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[1]["id"],
        },
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TaggableObjectType.Beneficiary,
            "tag": tag_data()[2]["id"],
        },
        {
            "object_id": box_without_qr_code_data()["id"],
            "object_type": TaggableObjectType.Box,
            "tag": tag_data()[2]["id"],
        },
    ]


def create():
    TagsRelation.insert_many(data()).execute()
