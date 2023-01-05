from ...enums import LocationType
from ...models.definitions.distribution_event import DistributionEvent
from ...models.definitions.location import Location


def get_base_distribution_events(*, base_id, states):
    """Return distribution events for base that match given states (default: all)."""
    state_filter = DistributionEvent.state << states if states else True
    return (
        DistributionEvent.select()
        .join(Location)
        .where(
            Location.base_id == base_id,
            Location.type == LocationType.DistributionSpot,
            state_filter,
        )
    )
