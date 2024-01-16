MOVED_BOXES_QUERY = """\
-- Common Table Expressions (CTEs) to identify valid locations and boxes
WITH recursive ValidLocations AS (
    SELECT id, box_state_id
    FROM locations
    WHERE camp_id = %s AND deleted IS NULL
),
ValidBoxes AS (
    SELECT
        s.id,
        s.box_id,
        s.items,
        s.location_id,
        l.box_state_id as default_box_state_id,
        s.size_id,
        s.box_state_id,
        s.product_id,
        s.created,
        s.modified
    FROM stock s
    JOIN ValidLocations l ON s.location_id = l.id
    WHERE s.deleted IS null
    -- Considering boxes whose state changed from 2023-01-01 onwards,
    -- since the changes in box_state_id are not recorded in the history table beforehand.
    -- Additionally, use the stock id instead of the creation timestamp to filter the data.
    AND s.id >= %s
),
BoxHistory AS (
    -- CTE to retrieve box history
    SELECT
        s.id AS stock_id,
        s.items AS stock_items,
        s.location_id AS stock_location_id,
        s.product_id AS stock_product_id,
        s.size_id AS stock_size_id,
        s.box_state_id AS stock_box_state_id,
        s.default_box_state_id,
        s.created AS stock_created,
        h.record_id,
        h.changes,
        h.changedate,
        s.box_id,
        h.from_int,
        h.to_int,
        h.changedate AS effective_from,
        h.id AS id
    FROM history h
    JOIN ValidBoxes s ON h.record_id = s.id AND h.to_int IS NOT null
    AND h.id >= %s AND h.tablename = 'stock'
    ORDER BY record_id, effective_from DESC, id DESC
),
HistoryReconstruction AS (
    -- CTE to reconstruct history
    SELECT
        h.id,
        h.record_id,
        h.box_id,
        IF(
            LAG(h.changedate, 1) OVER (PARTITION BY h.record_id ORDER BY h.id) IS NULL,
            h.stock_created,
            h.changedate
        ) AS effective_from,
        COALESCE(
            LEAD(h.changedate, 1) OVER (PARTITION BY h.record_id ORDER BY h.id),
            NOW()
        ) AS effective_to,
        h.from_int,
        h.to_int,
        h.changes,
        COALESCE(
            IF(h.changes <> 'items',
                COALESCE(
                    (SELECT IFNULL(his.from_int, 0)
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'items' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    IF(
                        h.changes = 'items',
                        IF(h.from_int IS NULL, 0, h.to_int),
                        COALESCE(
                            (SELECT IF(his.from_int IS NULL, 0, his.to_int)
                            FROM history his
                            WHERE his.record_id = h.record_id AND his.changes = 'items' AND his.id < h.id
                            ORDER BY his.id DESC
                            LIMIT 1),
                            h.stock_items
                        )
                    )
                ),
                h.to_int
            ),
            IFNULL(
                (SELECT IF(his.from_int IS NOT NULL, his.to_int, 0)
                FROM history his
                WHERE his.record_id = h.record_id AND his.changes = 'items' AND his.id < h.id
                ORDER BY his.id DESC
                LIMIT 1),
                h.stock_items
            )
        ) AS items,
        COALESCE(
            IF(h.changes <> 'location_id',
                COALESCE(
                    (SELECT IFNULL(his.from_int, 0)
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'location_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    IF(
                        h.changes = 'location_id',
                        IF(h.from_int IS NULL, 0, h.to_int),
                        COALESCE(
                            (SELECT IF(his.from_int IS NULL, 0, his.to_int)
                            FROM history his
                            WHERE his.record_id = h.record_id AND his.changes = 'location_id' AND his.id < h.id
                            ORDER BY his.id DESC
                            LIMIT 1),
                            h.stock_location_id
                        )
                    )
                ),
                h.to_int
            ),
            IFNULL(
                (SELECT IF(his.from_int IS NOT NULL, his.to_int, 0)
                FROM history his
                WHERE his.record_id = h.record_id AND his.changes = 'location_id' AND his.id < h.id
                ORDER BY his.id DESC
                LIMIT 1),
                h.stock_location_id
            )
        ) AS location_id,
        COALESCE(
            IF(h.changes <> 'box_state_id',
                COALESCE(
                    (SELECT IFNULL(his.from_int, 0)
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'box_state_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    IF(
                        h.changes = 'box_state_id',
                        IF(h.from_int IS NULL, 0, h.to_int),
                        COALESCE(
                            (SELECT IF(his.from_int IS NULL, 0, his.to_int)
                            FROM history his
                            WHERE his.record_id = h.record_id AND his.changes = 'box_state_id' AND his.id < h.id
                            ORDER BY his.id DESC
                            LIMIT 1),
                            h.stock_box_state_id
                        )
                    )
                ),
                h.to_int
            ),
            IFNULL(
                (SELECT IF(his.from_int IS NOT NULL, his.to_int, 0)
                FROM history his
                WHERE his.record_id = h.record_id AND his.changes = 'box_state_id' AND his.id < h.id
                ORDER BY his.id DESC
                LIMIT 1),
                h.stock_box_state_id
            )
        ) AS box_state_id,
        COALESCE(
            IF(h.changes <> 'product_id',
                COALESCE(
                    (SELECT IFNULL(his.from_int, 0)
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'product_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    IF(
                        h.changes = 'product_id',
                        IF(h.from_int IS NULL, 0, h.to_int),
                        COALESCE(
                            (SELECT IF(his.from_int IS NULL, 0, his.to_int)
                            FROM history his
                            WHERE his.record_id = h.record_id AND his.changes = 'product_id' AND his.id < h.id
                            ORDER BY his.id DESC
                            LIMIT 1),
                            h.stock_product_id
                        )
                    )
                ),
                h.to_int
            ),
            IFNULL(
                (SELECT IF(his.from_int IS NOT NULL, his.to_int, 0)
                FROM history his
                WHERE his.record_id = h.record_id AND his.changes = 'product_id' AND his.id < h.id
                ORDER BY his.id DESC
                LIMIT 1),
                h.stock_product_id
            )
        ) AS product_id,
        COALESCE(
            IF(h.changes <> 'size_id',
                COALESCE(
                    (SELECT IFNULL(his.from_int, 0)
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'size_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    IF(
                        h.changes = 'size_id',
                        IF(h.from_int IS NULL, 0, h.to_int),
                        COALESCE(
                            (SELECT IF(his.from_int IS NULL, 0, his.to_int)
                            FROM history his
                            WHERE his.record_id = h.record_id AND his.changes = 'size_id' AND his.id < h.id
                            ORDER BY his.id DESC
                            LIMIT 1),
                            h.stock_size_id
                        )
                    )
                ),
                h.to_int
            ),
            IFNULL(
                (SELECT IF(his.from_int IS NOT NULL, his.to_int, 0)
                FROM history his
                WHERE his.record_id = h.record_id AND his.changes = 'size_id' AND his.id < h.id
                ORDER BY his.id DESC
                LIMIT 1),
                h.stock_size_id
            )
        ) AS size_id,
        h.default_box_state_id AS stock_location_box_state_id,
        h.stock_items,
        h.stock_location_id,
        h.stock_product_id,
        h.stock_size_id,
        h.stock_box_state_id,
        h.stock_created,
        h.changedate
    FROM BoxHistory h
    ORDER BY id DESC
),
FinalResult AS (
    -- CTE for the final result
    SELECT
        h.id,
        h.box_id,
        h.box_state_id,
        date(effective_from) as moved_on,
        if(h.from_int <> h.box_state_id, h.from_int, h.box_state_id) AS prev_box_state_id,
        h.effective_from,
        h.effective_to,
        h.items AS number_of_items,
        h.location_id,
        p.category_id,
        h.product_id AS product,
        h.size_id,
        p.gender_id AS gender
    FROM HistoryReconstruction h
    JOIN products p ON p.id = h.product_id
    WHERE h.changes = 'box_state_id'
)
-- Main query to select the final result
select
    t.moved_on,
    t.category_id,
    TRIM(LOWER(p.name)) AS product_name,
    t.gender,
    t.size_id,
    loc.label AS target_id,
    count(DISTINCT t.box_id) AS boxes_count,
    0 AS items_count,
    sum(
        CASE
            WHEN t.prev_box_state_id = 1 AND t.box_state_id = 5 THEN 1
            WHEN t.prev_box_state_id = 5 AND t.box_state_id = 1 THEN -1
            ELSE 0
        END
    ) AS state_change_box_count,
    sum(
        CASE
            WHEN t.prev_box_state_id = 1 AND t.box_state_id = 5 THEN 1 * t.number_of_items
            WHEN t.prev_box_state_id = 5 AND t.box_state_id = 1 THEN -1 * t.number_of_items
            ELSE 0
        END
    ) AS state_change_items
FROM FinalResult t
JOIN products p ON p.id = t.product
JOIN sizes s ON s.id = t.size_id
JOIN locations loc ON loc.id = t.location_id
GROUP BY moved_on, t.category_id, p.name, t.gender, t.size_id, loc.label;
"""
