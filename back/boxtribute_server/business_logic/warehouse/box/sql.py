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
