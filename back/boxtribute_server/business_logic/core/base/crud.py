from ....models.definitions.base import Base
from ....models.utils import save_update_to_history


@save_update_to_history(
    fields=[
        Base.credit_per_adult,
        Base.credit_per_child,
        Base.cycle_start,
    ]
)
def update_base(
    *,
    id,
    base,
    user_id,
    now,
    credit_per_adult=None,
    credit_per_child=None,
):
    if credit_per_adult is not None:
        base.credit_per_adult = credit_per_adult
    if credit_per_child is not None:
        base.credit_per_child = credit_per_child
    if credit_per_adult is not None or credit_per_child is not None:
        base.cycle_start = now

    return base
