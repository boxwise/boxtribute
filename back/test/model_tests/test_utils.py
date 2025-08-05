import peewee
import pytest
from boxtribute_server.business_logic.box_transfer.shipment.fields import (
    first_letters_of_base_name,
)
from boxtribute_server.db import DatabaseManager, db
from boxtribute_server.models.definitions.base import Base
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.utils import (
    execute_sql,
    format_sql,
    handle_non_existing_resource,
)


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


def test_format_sql():
    query = DbChangeHistory.select(
        peewee.fn.IF(DbChangeHistory.change_date > 0, "new", None).alias("x")
    ).where(
        DbChangeHistory.table_name == "stock",
        DbChangeHistory.changes == "product_id",
        DbChangeHistory.from_int == 1,
    )
    formatted_query = format_sql(query)
    assert (
        formatted_query
        == 'SELECT IF((`t1`.`changedate` > 0), "new", NULL) AS `x` FROM `history` AS `t1` WHERE (((`t1`.`tablename` = "stock") AND (`t1`.`changes` = "product_id")) AND (`t1`.`from_int` = 1))'  # noqa
    )
    # Validate the formatted SQL
    result = execute_sql(query=formatted_query)
    assert result == []
