from datetime import date

from ariadne import ObjectType
from peewee import fn

from ..authz import authorize
from ..enums import HumanGender, TaggableObjectType
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation
from ..models.definitions.transaction import Transaction
from ..models.definitions.x_beneficiary_language import XBeneficiaryLanguage

beneficiary = ObjectType("Beneficiary")


@beneficiary.field("tags")
def resolve_beneficiary_tags(beneficiary_obj, _):
    authorize(permission="tag:read", base_id=beneficiary_obj.base_id)
    return (
        Tag.select()
        .join(TagsRelation)
        .where(
            (TagsRelation.object_id == beneficiary_obj.id)
            & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
        )
    )


@beneficiary.field("tokens")
def resolve_beneficiary_tokens(beneficiary_obj, _):
    authorize(permission="transaction:read")
    # If the beneficiary has no transactions yet, the select query returns None
    return (
        Transaction.select(fn.sum(Transaction.tokens))
        .where(Transaction.beneficiary == beneficiary_obj.id)
        .scalar()
        or 0
    )


@beneficiary.field("transactions")
def resolve_beneficiary_transactions(beneficiary_obj, _):
    authorize(permission="transaction:read")
    return Transaction.select().where(Transaction.beneficiary == beneficiary_obj.id)


@beneficiary.field("registered")
def resolve_beneficiary_registered(beneficiary_obj, _):
    return not beneficiary_obj.not_registered


@beneficiary.field("languages")
def resolve_beneficiary_languages(beneficiary_obj, _):
    return [
        x.language.id
        for x in XBeneficiaryLanguage.select().where(
            XBeneficiaryLanguage.beneficiary == beneficiary_obj.id
        )
    ]


@beneficiary.field("gender")
def resolve_beneficiary_gender(beneficiary_obj, _):
    if beneficiary_obj.gender == "":
        return
    return HumanGender(beneficiary_obj.gender)


@beneficiary.field("age")
def resolve_beneficiary_age(beneficiary_obj, _):
    dob = beneficiary_obj.date_of_birth
    if dob is None:
        return
    today = date.today()
    # Subtract 1 if current day is before birthday in current year
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


@beneficiary.field("active")
def resolve_beneficiary_active(beneficiary_obj, _):
    return beneficiary_obj.deleted is None  # ZeroDateTimeField


@beneficiary.field("base")
def resolve_beneficiary_base(beneficiary_obj, _):
    authorize(permission="base:read", base_id=beneficiary_obj.base_id)
    return beneficiary_obj.base
