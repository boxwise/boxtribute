"""Computation of various metrics"""
from datetime import date

from peewee import JOIN

from .definitions.base import Base
from .definitions.beneficiary import Beneficiary
from .definitions.transaction import Transaction


def compute_number_of_families_served(*, organisation_id, after):
    after = after or date.today()
    return (
        Beneficiary.select()
        .join(Base)
        .where(
            (Base.organisation == organisation_id)
            & (
                Beneficiary.id
                << (
                    Beneficiary.select()
                    .join(Transaction, JOIN.LEFT_OUTER)
                    .where((Transaction.created_on > after) & (Transaction.count > 0))
                ).distinct()
            )
        )
        .count()
    )
