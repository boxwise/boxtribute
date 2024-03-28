import peewee
import pytest
from boxtribute_server.business_logic.box_transfer.shipment.fields import (
    first_letters_of_base_name,
)
from boxtribute_server.db import DatabaseManager, db
from boxtribute_server.models.definitions.base import Base
from boxtribute_server.models.utils import handle_non_existing_resource


@pytest.mark.parametrize("base_id,result", [[1, "TH"], [2, "AS"], [3, "WÜ"]])
def test_first_letters_of_base_name(base_id, result):
    base = Base.get_by_id(base_id)
    assert first_letters_of_base_name(base) == result


def test_unitialized_database_manager():
    manager = DatabaseManager()
    with pytest.raises(RuntimeError):
        manager.get_model_class()

    # Verify dev error in handle_non_existing_resource()
    @handle_non_existing_resource
    def func():
        db.database.execute_sql("""UPDATE stock SET box_state_id = 0 WHERE id = 2;""")

    with pytest.raises(peewee.IntegrityError, match="REFERENCES `box_state`"):
        func()
