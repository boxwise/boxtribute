import zoneinfo
from datetime import datetime, time
from datetime import timezone as dtimezone

from peewee import fn
from sentry_sdk import capture_message as emit_sentry_message

from ....db import db
from ....enums import TransferAgreementState, TransferAgreementType
from ....exceptions import (
    DuplicateTransferAgreement,
    InvalidTransferAgreementBase,
    InvalidTransferAgreementDates,
    InvalidTransferAgreementOrganisation,
    InvalidTransferAgreementState,
    NoActivePartnerBases,
)
from ....models.definitions.base import Base
from ....models.definitions.transfer_agreement import TransferAgreement
from ....models.definitions.transfer_agreement_detail import TransferAgreementDetail
from ....models.utils import convert_ids, utcnow


def _base_ids_of_organisation(organisation_id):
    """Return IDs of non-deleted bases that belong to the organisation with given ID."""
    return [
        b.id
        for b in Base.select(Base.id).where(
            Base.organisation_id == organisation_id,
            Base.deleted_on.is_null(),
        )
    ]


def _validate_bases_as_part_of_organisation(*, base_ids, organisation_id):
    """Raise InvalidTransferAgreementBase exception if any of the given bases is not run
    by the given organisation, or deleted.
    """
    organisation_base_ids = _base_ids_of_organisation(organisation_id)
    invalid_base_ids = [i for i in base_ids if i not in organisation_base_ids]
    if invalid_base_ids:
        raise InvalidTransferAgreementBase(
            expected_base_ids=organisation_base_ids,
            base_id=invalid_base_ids[0],
        )


def _validate_unique_transfer_agreement(
    *, organisation_ids, base_ids, valid_from, valid_until
):
    """Validate that the agreement with given organisation IDs and base IDs is unique,
    i.e. no other UnderReview or Accepted agreement among the same organisations and
    with the same set of involved bases (or a superset thereof), and with a fully
    overlapping validity period must exist.
    """
    convert_ids_to_set = lambda ids: set(convert_ids(ids))
    agreements = (
        TransferAgreement.select(
            TransferAgreement.id,
            TransferAgreement.source_organisation,
            TransferAgreement.target_organisation,
            TransferAgreement.valid_from,
            TransferAgreement.valid_until,
            fn.GROUP_CONCAT(TransferAgreementDetail.source_base)
            .python_value(convert_ids_to_set)
            .alias("source_base_ids"),
            fn.GROUP_CONCAT(TransferAgreementDetail.target_base)
            .python_value(convert_ids_to_set)
            .alias("target_base_ids"),
        )
        .join(TransferAgreementDetail)
        .where(
            TransferAgreement.source_organisation << organisation_ids,
            TransferAgreement.target_organisation << organisation_ids,
            TransferAgreement.state
            << [TransferAgreementState.UnderReview, TransferAgreementState.Accepted],
            TransferAgreement.valid_from <= valid_from,
        )
        .group_by(TransferAgreement.id)
        .namedtuples()
    )

    for am in agreements:
        if (
            organisation_ids.issubset({am.source_organisation, am.target_organisation})
            and base_ids.issubset(am.source_base_ids.union(am.target_base_ids))
            and (
                valid_from >= am.valid_from
                # Logic table for the following conditional
                # valid_until | am.valid_until | duplicate (if valid_from is newer, too)
                # ------------|----------------|----------
                # 2022-01-20  | None           | yes
                # None        | None           | yes
                # None        | 2022-03-31     | no
                # 2022-01-20  | 2022-03-31     | yes
                # 2022-01-20  | 2022-01-01     | no
                and (
                    am.valid_until is None
                    or (valid_until <= am.valid_until if valid_until else True)
                )
            )
        ):
            raise DuplicateTransferAgreement(agreement_id=am.id)


def _convert_dates_to_utc_datetimes(valid_from, valid_until, timezone, now):
    """Use given valid_* dates and insert time information such that start/end is at
    midnight. Let valid_from default to current UTC time.
    Return converted datetimes (UTC but without timezone information) as tuple.
    """
    tzinfo = zoneinfo.ZoneInfo(timezone)
    if valid_from is not None:
        valid_from = (
            datetime.combine(valid_from, time(), tzinfo=tzinfo)
            .astimezone(dtimezone.utc)
            .replace(tzinfo=None)
        )
    else:
        valid_from = now.replace(tzinfo=None)

    if valid_until is not None:
        valid_until = (
            datetime.combine(valid_until, time(23, 59, 59), tzinfo=tzinfo)
            .astimezone(dtimezone.utc)
            .replace(tzinfo=None)
        )

    return valid_from, valid_until


def create_transfer_agreement(
    *,
    initiating_organisation_id,
    partner_organisation_id,
    type,
    initiating_organisation_base_ids,
    partner_organisation_base_ids=None,
    valid_from=None,
    valid_until=None,
    comment=None,
    user,
):
    """Insert information for a new TransferAgreement in the database. Update
    TransferAgreementDetail model with given source/target base information. By default,
    the agreement is established with all non-deleted bases of the partner organisation.
    As a result, any base added to the partner organisation afterwards will NOT be part
    of the agreement. A new agreement needs to be created then to transfer goods with
    the new base.
    Convert optional local dates into UTC datetimes using user timezone information.
    Raise an InvalidTransferAgreementOrganisation exception if the current user's
    organisation is identical to the target organisation.
    Raise a DuplicateTransferAgreement exception if the agreement requested to be
    created would not be unique.
    Raise an InvalidTransferAgreementBase expection if any specified source/target base
    is not part of the source/target organisation.
    Raise InvalidTransferAgreementDates exception if valid_from is not earlier than
    valid_until.
    Raise NoActivePartnerBases exception if specified partner bases (default: all bases
    of the partner organisation) are inactive.
    """
    if initiating_organisation_id == partner_organisation_id:
        raise InvalidTransferAgreementOrganisation()

    now = utcnow()
    valid_from, valid_until = _convert_dates_to_utc_datetimes(
        valid_from, valid_until, user.timezone, now
    )

    if valid_until and valid_from.date() >= valid_until.date():
        raise InvalidTransferAgreementDates()

    # In GraphQL input, partner organisation base IDs can be omitted, hence substitute
    # actual base IDs of partner organisation. Avoid duplicate base IDs by creating sets
    initiating_organisation_base_ids = set(initiating_organisation_base_ids)
    if partner_organisation_base_ids is None:
        partner_organisation_base_ids = set(
            _base_ids_of_organisation(partner_organisation_id)
        )
    else:
        partner_organisation_base_ids = set(partner_organisation_base_ids)

    if not partner_organisation_base_ids:
        raise NoActivePartnerBases()

    _validate_unique_transfer_agreement(
        organisation_ids={initiating_organisation_id, partner_organisation_id},
        base_ids=initiating_organisation_base_ids.union(partner_organisation_base_ids),
        valid_from=valid_from,
        valid_until=valid_until,
    )

    if type == TransferAgreementType.ReceivingFrom:
        # Initiating organisation will be transfer target, the partner organisation will
        # be source
        source_organisation_id = partner_organisation_id
        target_organisation_id = initiating_organisation_id
        source_base_ids = partner_organisation_base_ids
        target_base_ids = initiating_organisation_base_ids
    else:
        # Agreement type SendingTo or Bidirectional
        source_organisation_id = initiating_organisation_id
        target_organisation_id = partner_organisation_id
        source_base_ids = initiating_organisation_base_ids
        target_base_ids = partner_organisation_base_ids

    _validate_bases_as_part_of_organisation(
        base_ids=source_base_ids, organisation_id=source_organisation_id
    )
    _validate_bases_as_part_of_organisation(
        base_ids=target_base_ids, organisation_id=target_organisation_id
    )

    with db.database.atomic():
        transfer_agreement = TransferAgreement.create(
            source_organisation=source_organisation_id,
            target_organisation=target_organisation_id,
            type=type,
            valid_from=valid_from,
            valid_until=valid_until,
            requested_on=now,
            requested_by=user.id,
            comment=comment,
        )

        # Build all combinations of source and target organisation bases under current
        # agreement. The type of agreement is not taken into account (see
        # shipment._validate_bases_as_part_of_transfer_agreement)
        details_data = [
            {
                "source_base": s,
                "target_base": t,
                "transfer_agreement": transfer_agreement.id,
            }
            for s in source_base_ids
            for t in target_base_ids
        ]
        TransferAgreementDetail.insert_many(details_data).execute()

        if len(source_base_ids) > 1 or len(target_base_ids) > 1:
            emit_sentry_message(
                "Created multi-base agreement",
                level="warning",
                extras={
                    "transfer_agreement_id": transfer_agreement.id,
                    "source_base_ids": list(source_base_ids),
                    "target_base_ids": list(target_base_ids),
                },
            )

        return transfer_agreement


def accept_transfer_agreement(*, agreement, user):
    """Transition state of specified transfer agreement to 'Accepted'.
    Raise an InvalidTransferAgreementState exception if agreement state different from
    'UnderReview'.
    """
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Accepted
    agreement.accepted_by = user.id
    agreement.accepted_on = utcnow()
    agreement.save()
    return agreement


def reject_transfer_agreement(*, agreement, user):
    """Transition state of specified transfer agreement to 'Rejected'.
    Raise an InvalidTransferAgreementState exception if agreement state different from
    'UnderReview'.
    """
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Rejected
    agreement.terminated_by = user.id
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def cancel_transfer_agreement(*, agreement, user):
    """Transition state of specified transfer agreement to 'Canceled'.
    Raise error if agreement state different from 'UnderReview'/'Accepted'.
    Any shipments derived from the agreement are not affected.
    """
    if agreement.state not in [
        TransferAgreementState.UnderReview,
        TransferAgreementState.Accepted,
    ]:
        raise InvalidTransferAgreementState(
            expected_states=[
                TransferAgreementState.UnderReview,
                TransferAgreementState.Accepted,
            ],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Canceled
    agreement.terminated_by = user.id
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def retrieve_transfer_agreement_bases(*, agreement, kind):
    """Return all bases (kind: source or target) involved in the given transfer
    agreement.
    """
    return (
        Base.select()
        .join(
            TransferAgreementDetail, on=getattr(TransferAgreementDetail, f"{kind}_base")
        )
        .where(TransferAgreementDetail.transfer_agreement == agreement.id)
        .distinct()
    )
