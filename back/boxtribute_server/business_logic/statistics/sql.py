MOVED_BOXES_QUERY = """\
-- Common Table Expressions (CTEs) to identify valid locations and boxes
WITH recursive ValidLocations AS (
    SELECT id
    FROM locations
    WHERE camp_id = %s AND deleted IS NULL
),
ValidBoxes AS (
    SELECT
        s.id,
        s.items,
        s.location_id,
        s.size_id,
        s.box_state_id,
        s.product_id
    FROM stock s
    JOIN ValidLocations l ON s.location_id = l.id
    WHERE s.deleted IS null
    -- Considering boxes whose state changed from 2023-01-01 onwards,
    -- since the changes in box_state_id are not recorded in the history table beforehand.
    -- Additionally, use the stock id instead of the creation timestamp to filter the data.
    AND s.id >= %s
),
BoxHistory AS (
    -- CTE to retrieve box history (only include changes in FK fields such as
    -- product, size, location, box state, as well as number of items).
    -- Select only changes from 2023-01-01 and newer
    SELECT
        s.id AS box_id,
        s.items AS stock_items,
        s.location_id AS stock_location_id,
        s.product_id AS stock_product_id,
        s.size_id AS stock_size_id,
        s.box_state_id AS stock_box_state_id,
        h.record_id,
        h.changes,
        h.changedate,
        h.from_int,
        h.to_int,
        h.id AS id
    FROM history h
    JOIN ValidBoxes s ON h.record_id = s.id AND h.to_int IS NOT null
    AND h.id >= %s AND h.tablename = 'stock'
    ORDER BY record_id, changedate DESC, id DESC
),
HistoryReconstruction AS (
    -- CTE to reconstruct box versions
    -- For each change in product, size, location, box state, or number of items,
    -- reconstruct the box version at that time
    SELECT
        h.box_id,
        h.from_int,
        h.to_int,
        h.changes,
        h.changedate,
        IF(h.changes <> 'items',
                -- The current change is NOT about number of items, hence the correct number of items
                -- of the box at this time must be inferred
                COALESCE(
                    -- Look for the next change in number of items related to the box and use 'from_int' value
                    (SELECT his.from_int
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'items' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    -- Look for the previous change in number of items related to the box and use 'to_int' value
                    COALESCE(
                        (SELECT his.to_int
                        FROM history his
                        WHERE his.record_id = h.record_id AND his.changes = 'items' AND his.id < h.id
                        ORDER BY his.id DESC
                        LIMIT 1),
                        -- No change in number of items ever happened to the box
                        h.stock_items
                    )
                ),
                -- The current change is about number of items
                h.to_int
        ) AS items,
        IF(h.changes <> 'location_id',
                COALESCE(
                    (SELECT his.from_int
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'location_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    COALESCE(
                        (SELECT his.to_int
                        FROM history his
                        WHERE his.record_id = h.record_id AND his.changes = 'location_id' AND his.id < h.id
                        ORDER BY his.id DESC
                        LIMIT 1),
                        h.stock_location_id
                    )
                ),
                h.to_int
        ) AS location_id,
        IF(h.changes <> 'box_state_id',
                COALESCE(
                    (SELECT his.from_int
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'box_state_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    COALESCE(
                        (SELECT his.to_int
                        FROM history his
                        WHERE his.record_id = h.record_id AND his.changes = 'box_state_id' AND his.id < h.id
                        ORDER BY his.id DESC
                        LIMIT 1),
                        h.stock_box_state_id
                    )
                ),
                h.to_int
        ) AS box_state_id,
        IF(h.changes <> 'product_id',
                COALESCE(
                    (SELECT his.from_int
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'product_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    COALESCE(
                        (SELECT his.to_int
                        FROM history his
                        WHERE his.record_id = h.record_id AND his.changes = 'product_id' AND his.id < h.id
                        ORDER BY his.id DESC
                        LIMIT 1),
                        h.stock_product_id
                    )
                ),
                h.to_int
        ) AS product_id,
        IF(h.changes <> 'size_id',
                COALESCE(
                    (SELECT his.from_int
                    FROM history his
                    WHERE his.record_id = h.record_id AND his.changes = 'size_id' AND his.id > h.id
                    ORDER BY his.id ASC
                    LIMIT 1),
                    COALESCE(
                        (SELECT his.to_int
                        FROM history his
                        WHERE his.record_id = h.record_id AND his.changes = 'size_id' AND his.id < h.id
                        ORDER BY his.id DESC
                        LIMIT 1),
                        h.stock_size_id
                    )
                ),
                h.to_int
        ) AS size_id
    FROM BoxHistory h
    ORDER BY id DESC
),
FinalResult AS (
    -- CTE for selecting all box versions at the time of box state changes
    SELECT
        h.box_id,
        h.box_state_id,
        date(h.changedate) as moved_on,
        if(h.from_int <> h.box_state_id, h.from_int, h.box_state_id) AS prev_box_state_id,
        h.items AS number_of_items,
        h.location_id,
        h.product_id AS product,
        h.size_id
    FROM HistoryReconstruction h
    WHERE h.changes = 'box_state_id'
)

-- Main query to perform aggregation and grouping of boxes being moved between states
-- InStock and Donated
select
    t.moved_on,
    p.category_id,
    TRIM(LOWER(p.name)) AS product_name,
    p.gender_id AS gender,
    t.size_id,
    GROUP_CONCAT(DISTINCT tr.tag_id) AS tag_ids,
    loc.label AS target_id,
    NULL AS organisation_name,
    %s AS target_type,
    sum(
        CASE
            WHEN t.prev_box_state_id = 1 AND t.box_state_id = 5 THEN 1
            WHEN t.prev_box_state_id = 5 AND t.box_state_id = 1 THEN -1
            ELSE 0
        END
    ) AS boxes_count,
    sum(
        CASE
            WHEN t.prev_box_state_id = 1 AND t.box_state_id = 5 THEN 1 * t.number_of_items
            WHEN t.prev_box_state_id = 5 AND t.box_state_id = 1 THEN -1 * t.number_of_items
            ELSE 0
        END
    ) AS items_count
FROM FinalResult t
JOIN products p ON p.id = t.product
JOIN locations loc ON loc.id = t.location_id
LEFT OUTER JOIN tags_relations tr ON tr.object_id = t.box_id AND tr.object_type = "Stock"
WHERE (t.prev_box_state_id = 1 AND t.box_state_id = 5) OR
      (t.prev_box_state_id = 5 AND t.box_state_id = 1)
GROUP BY moved_on, p.category_id, p.name, p.gender_id, t.size_id, loc.label

UNION ALL

-- Collect information about all boxes sent from the specified base as source, that
-- were not removed from the shipment during preparation
SELECT
    DATE(sh.sent_on) AS moved_on,
    p.category_id,
    TRIM(LOWER(p.name)) AS product_name,
    p.gender_id AS gender,
    d.source_size_id AS size_id,
    GROUP_CONCAT(DISTINCT tr.tag_id) AS tag_ids,
    c.name AS target_id,
    o.label AS organisation_name,
    %s AS target_type,
    COUNT(d.box_id) AS boxes_count,
    SUM(d.source_quantity) AS items_count
FROM
    shipment_detail d
JOIN
    shipment sh
ON
    d.shipment_id = sh.id AND
    d.removed_on IS NULL AND
    sh.source_base_id = %s AND
    sh.sent_on IS NOT NULL
JOIN camps c ON c.id = sh.target_base_id
JOIN organisations o on o.id = c.organisation_id
JOIN products p ON p.id = d.source_product_id
LEFT OUTER JOIN tags_relations tr ON tr.object_id = d.box_id AND tr.object_type = "Stock"
GROUP BY moved_on, p.category_id, p.name, p.gender_id, d.source_size_id, c.name

UNION ALL

-- Collect information about boxes that were turned into Lost/Scrap state; it is
-- assumed that these boxes have not been further moved but still are part of the
-- specified base
SELECT
    DATE(h.changedate) AS moved_on,
    p.category_id,
    TRIM(LOWER(p.name)) AS product_name,
    p.gender_id AS gender,
    b.size_id,
    GROUP_CONCAT(DISTINCT tr.tag_id) AS tag_ids,
    bs.label AS target_id,
    NULL AS organisation_name,
    %s AS target_type,
    COUNT(h.id) AS boxes_count,
    SUM(b.items) AS items_count
FROM
    history h
JOIN
    stock b
ON
    h.tablename = "stock" AND
    h.changes = "box_state_id" AND
    h.record_id = b.id AND
    h.from_int = 1 AND
    h.to_int IN (2, 6) -- (Lost, Scrap)
JOIN products p ON p.id = b.product_id AND p.camp_id = %s
JOIN box_state bs on bs.id = h.to_int
LEFT OUTER JOIN tags_relations tr ON tr.object_id = b.id AND tr.object_type = "Stock"
GROUP BY moved_on, p.category_id, p.name, p.gender_id, b.size_id, bs.label
;
"""
