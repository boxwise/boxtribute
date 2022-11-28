from ariadne import ObjectType, convert_kwargs_to_snake_case

from ...authz import authorize
from ...enums import DistributionEventState, LocationType, TaggableObjectType, TagType
from ...graph_ql.filtering import derive_beneficiary_filter
from ...graph_ql.pagination import load_into_page
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)
from ...models.definitions.location import Location
from ...models.definitions.product import Product
from ...models.definitions.tag import Tag
from .crud import get_base_distribution_events

base = ObjectType("Base")


@base.field("products")
@convert_kwargs_to_snake_case
def resolve_base_products(base_obj, *_):
    authorize(permission="product:read", base_id=base_obj.id)
    return Product.select().where(
        Product.base == base_obj.id,
        # work-around for 0000-00-00 00:00:00 datetime fields in database
        (Product.deleted.is_null() | (Product.deleted == 0)),
    )


@base.field("locations")
def resolve_base_locations(base_obj, _):
    authorize(permission="location:read", base_id=base_obj.id)
    return Location.select().where(
        Location.base == base_obj.id,
        Location.type == LocationType.ClassicLocation,
        Location.deleted.is_null(),
    )


@base.field("tags")
@convert_kwargs_to_snake_case
def resolve_base_tags(base_obj, _, resource_type=None):
    authorize(permission="tag:read", base_id=base_obj.id)

    filter_condition = True
    if resource_type == TaggableObjectType.Box:
        filter_condition = Tag.type << [TagType.Box, TagType.All]
    elif resource_type == TaggableObjectType.Beneficiary:
        filter_condition = Tag.type << [TagType.Beneficiary, TagType.All]

    return Tag.select().where(
        Tag.base == base_obj.id, Tag.deleted.is_null(), filter_condition
    )


@base.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_base_beneficiaries(base_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read", base_id=base_obj.id)
    base_filter_condition = Beneficiary.base == base_obj.id
    filter_condition = base_filter_condition & derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary, filter_condition, pagination_input=pagination_input
    )


@base.field("distributionEvents")
def resolve_distributions_events_for_base(base_obj, _, states=None):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    return get_base_distribution_events(states=states, base_id=base_obj.id)


@base.field("distributionEventsStatistics")
def resolve_base_distribution_events_statistics(base_obj, _):
    authorize(permission="distro_event:read", base_id=base_obj.id)

    res = DistributionEventsTrackingGroup.raw(
        """select
        p.name as product_name,
        genders.label as gender_label,
        cat.label as category_label,
        siz.label as size_label,
        MAX(detl.inflow) as inflow,
        MAX(detl.outflow) as outflow,
        min(ev.planned_start_date_time) earliest_possible_distro_date,
        max(ev.planned_end_date_time) latest_possible_distro_date,
        GROUP_CONCAT(distinct spot.label SEPARATOR ', ')
          as potentially_involved_distribution_spots,
        detl.distro_event_tracking_group_id,
        GROUP_CONCAT(distinct ev.id SEPARATOR ',') as involved_distribution_event_ids,
        detl.product_id,
        detl.size_id
        from (
            select detl.distro_event_tracking_group_id,
            detl.product_id,
            detl.size_id,
            detl.location_id,
            SUM(CASE WHEN detl.flow_direction = "In"
              THEN detl.number_of_items ELSE 0 END
            ) inflow,
            SUM(CASE WHEN detl.flow_direction = "Out"
              THEN detl.number_of_items ELSE 0 END
            ) outflow
            from distro_events_tracking_logs detl
            inner join distro_events_tracking_groups tracking_group
              on tracking_group.id = detl.distro_event_tracking_group_id
            where tracking_group.base_id = '%s'
            group by detl.distro_event_tracking_group_id, detl.product_id,
              detl.size_id, detl.location_id, detl.flow_direction
        ) as detl
        inner join distro_events ev
          on ev.distro_event_tracking_group_id = detl.distro_event_tracking_group_id
        inner join locations spot on spot.id = ev.location_id
        inner join products p on p.id = detl.product_id
        inner join genders on genders.id = p.gender_id
        inner join product_categories cat on cat.id = p.category_id
        inner join sizes siz on siz.id = detl.size_id
        group by
        detl.distro_event_tracking_group_id,
        detl.product_id,
        p.name,
        genders.label,
        p.category_id,
        cat.label,
        detl.size_id""",
        base_obj.id,
    )
    return res


@base.field("distributionSpots")
def resolve_base_distributions_spots(base_obj, _):
    authorize(permission="location:read", base_id=base_obj.id)
    return Location.select().where(
        Location.base == base_obj.id,
        Location.type == LocationType.DistributionSpot,
    )


@base.field("distributionEventsTrackingGroups")
def resolve_base_distribution_events_tracking_groups(base_obj, _, states=None):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    state_filter = DistributionEventsTrackingGroup.state << states if states else True
    return DistributionEventsTrackingGroup.select().where(
        (DistributionEventsTrackingGroup.base == base_obj.id) & (state_filter)
    )


@base.field("distributionEventsBeforeReturnedFromDistributionState")
def resolve_distribution_events_before_return_state(base_obj, *_):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    return get_base_distribution_events(
        base_id=base_obj.id,
        states=[
            DistributionEventState.Planning,
            DistributionEventState.Packing,
            DistributionEventState.OnDistro,
        ],
    )


@base.field("distributionEventsInReturnedFromDistributionState")
def resolve_distribution_events_in_return_state(base_obj, *_):
    authorize(permission="distro_event:read", base_id=base_obj.id)
    return get_base_distribution_events(
        base_id=base_obj.id, states=[DistributionEventState.ReturnedFromDistribution]
    )
