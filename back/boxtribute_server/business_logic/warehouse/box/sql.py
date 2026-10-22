BOXES_WITH_MISSING_TAGS_QUERY = """\
WITH box_ids AS (
    -- Map the provided box label identifiers to their corresponding IDs
    SELECT s.id
    FROM stock s
    INNER JOIN locations l
    ON l.id = s.location_id
    WHERE s.box_id IN %s
    -- filter out deleted boxes
    AND (s.deleted IS NULL OR NOT s.deleted)
    -- filter out boxes in bases different from the tags' base
    AND l.camp_id = %s
    -- filter out non-warehouse-state boxes
    AND s.box_state_id IN %s
),
tag_ids AS (
    SELECT id
    FROM tags
    WHERE id IN %s
),
box_tag_combinations AS (
    -- Generate all combinations of box IDs and tag IDs
    SELECT
        box_ids.id as box_id,
        tag_ids.id AS tag_id
    FROM box_ids CROSS JOIN tag_ids
),
existing_relations AS (
    -- Find existing box-to-tag assignments
    SELECT object_id AS box_id, tag_id
    FROM tags_relations
    WHERE object_type = "Stock"
    AND deleted_on IS NULL
    AND object_id IN (SELECT id FROM box_ids)
    AND tag_id IN (SELECT id FROM tag_ids)
),
missing_tags AS (
    -- Identify missing tags for each box
    SELECT
        btc.box_id,
        btc.tag_id
    FROM
        box_tag_combinations btc
    LEFT JOIN existing_relations er
        ON btc.box_id = er.box_id AND btc.tag_id = er.tag_id
    WHERE
        er.tag_id IS NULL
)
-- Aggregate the missing tags per box
SELECT
    s.box_id as label_identifier,
    s.id,
    GROUP_CONCAT(mt.tag_id) AS missing_tag_ids
FROM
    missing_tags mt
INNER JOIN stock s
    ON s.id = mt.box_id
GROUP BY
    mt.box_id;
        """


BOX_ROWS_QUERY = """\
SELECT
    b.id,
    b.box_id AS label_identifier,
    b.items AS number_of_items,
    b.comments AS comment,
    b.weight,
    b.monetary_value,
    units.symbol AS weight_unit_symbol,
    b.created AS created_on,
    b.modified AS last_modified_on,
    u.id AS created_by_id,
    u.naam AS created_by_name,
    um.id AS last_modified_by_id,
    um.naam AS last_modified_by_name,
    b.box_state_id AS state,
    p.id AS product_id,
    p.name AS product_name,
    p.gender_id AS product_gender,
    p.standard_product_id IS NOT NULL AS contains_standard_product,
    pc.id AS product_category_id,
    pc.label AS product_category_name,
    sz.id AS size_id,
    sz.label AS size_name,
    l.id AS location_id,
    l.label AS location_name,
    sd.id AS shipment_detail_id,
    sh.id AS shipment_id,
    b.qr_id IS NOT NULL AS has_qr_code,
    (SELECT GROUP_CONCAT(tr.tag_id)
     FROM tags_relations tr
     WHERE tr.object_id = boxes_page.id
     AND tr.object_type = 'stock'
     AND tr.deleted_on IS NULL) AS tag_ids
FROM (
    SELECT stock.id, product_id, size_id
    FROM stock
    JOIN locations l on l.id = location_id
    JOIN products p on p.id = product_id
    WHERE stock.deleted IS NULL AND l.camp_id = %s
    ORDER BY p.name ASC, id ASC
    LIMIT 50 -- OFFSET 10000
) boxes_page
JOIN stock b ON b.id = boxes_page.id
JOIN locations l ON l.id = b.location_id
-- JOIN camps c ON c.id = l.camp_id
JOIN products p ON p.id = b.product_id
JOIN sizes sz ON sz.id = b.size_id
JOIN product_categories pc ON pc.id = p.category_id
LEFT OUTER JOIN cms_users u ON u.id = b.created_by
LEFT OUTER JOIN cms_users um ON um.id = b.modified_by
LEFT OUTER JOIN shipment_detail sd ON sd.box_id = b.id and sd.removed_on is NULL
LEFT OUTER JOIN shipment sh ON sh.id = sd.shipment_id
LEFT OUTER JOIN units ON units.id = b.weight_display_unit_id
;"""
