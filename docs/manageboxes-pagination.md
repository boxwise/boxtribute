# ManageBoxes pagination update

## Problem

The ManageBoxes FE currently fetches a possibly large number of (non-deleted) boxes from the BE (default: 100,000; in `prepareBoxesForBoxesViewQueryVariables`). While the querying of the raw data from MySQL is not expensive, building the GraphQL response in the ariadne resolvers is due to the large, nested structure of the request.
As a consequence we've been observing large loading times for bases with lots of boxes.
E.g. in the last 90d:
- base 3 (IHA; 6.2k boxes): 18s (168 queries)
- base 49 (Eurorelief; 5k InStock + 5k Donated + 2.3k Scrap boxes): 20s (39 queries)

Pure SQL query for comparison (base 3): 2s

## Proposed solution

Utilize server-side pagination to load a page of only 100 records at once to meet an ideal loading time of 2s or less.

### Consequences

- more responsive ManageBoxes for bases with thousands of boxes
- unchanged: filtering and bulk-actions
- sorting: only single-field sorting (react-table allows for filtering by multiple fields)
- text search: disable/restrict to client-side data/re-implement on BE (**decision needed**)
- for v2 ManageBeneficiaries, bulk-mutations and FE pagination can be designed and implemented with the more performant concept in mind

## Details

This summarizes the current features and functionality.

### FE functionality and GraphQL API usage

- data display
    - 50 boxes per page
    - summary (total nr of boxes and items, total weight and value; given current filters)
    - sorting (default: last modified on, descending. Options: box label, product name, category name, gender, size, number of items, weight, value, state, location name, number of tags, comments, last-modified-by name, created-by name. Sort orders: descending, ascending)
    - filtering (product, category, gender, size, state, location, tags, creation date) and filter clearing
    - search (text search of table content, case-insensitive)
    - page navigation (forward and backward)
- actions on existing boxes (with single/multi-select, page-select, or select-all)
    - delete boxes (`deleteBoxes` bulk-mutation)
    - assign tags (`assignTagsToBoxes` bulk-mutation)
    - remove tags (`unassignTagsFromBoxes` bulk-mutation)
    - make labels (forward to dropapp /pdf/qr.php)
    - export CSV (client-side)
    - move to location (`moveBoxesToLocation` bulk-mutation)
    - add to shipment (`updateShipmentWhenPreparing` bulk-mutation)

### BE pagination

- cursor-based pagination for `boxes` query
- ordering by `Box.last_modified_on.desc` (hard-coded)
- cursor: base64-encoded box ID
- implementation details [in the codebase](https://github.com/boxwise/boxtribute/blob/a8e903da45a48451ae9da81c18a29b2c0581460e/back/boxtribute_server/graph_ql/pagination.py#L1-L38)

<details>
  <summary>Current GraphQL API</summary>

```graphql
type Query {
  boxes(baseId: ID!, paginationInput: PaginationInput, filterInput: FilterBoxInput): BoxPage!
}

input FilterBoxInput {
  " Filter for all boxes that have *one* of the specified states. "
  states: [BoxState!]
  " Filter for all boxes that who were last modified on this date (incl.), or later. "
  lastModifiedFrom: Date
  " Filter for all boxes that who were last modified on this date (incl.), or earlier. "
  lastModifiedUntil: Date
  productGender: ProductGender
  " Filter for all boxes that have *one* of the specified product genders. "
  productGenders: [ProductGender!]
  productCategoryId: Int
  " Filter for all boxes that have *one* of the specified product categories. "
  productCategoryIds: [Int!]
  productId: Int
  " Filter for all boxes that have *one* of the specified products. "
  productIds: [Int!]
  sizeId: Int
  " Filter for all boxes that have *at least one* of the specified tags. "
  tagIds: [Int!]
  " Filter for all boxes that are in *one* of the specified locations. "
  locationIds: [Int!]
}

type BoxPage {
  elements: [Box!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

</details>

## Implementation plan

### Back-end / API

Estimate: 6-8h

1. fix cursor-based pagination to handle different sorting fields and sort order
1. extend sorting API (14 sort fields)
1. extend filter API to also handle size and excluded tags
1. extend all box-related bulk-mutations to handle filter options instead of label identifiers (to enable actions with select-all active)
1. new CSV export-all query
1. extend BoxPage type to include summary info
1. bonus: limit page size that can be requested through the API (e.g. 500)

### Front-end

Estimate: 6-8h

1. drop background-loading of InStock/Donated/Lost boxes
1. adjust page size (100) to require less server round-trips
1. run BE request when new filters applied
1. run BE request when sorting changed
1. run BE request when navigating to next page
1. if select-all active and bulk-action requested, send applied filters along with bulk-mutation, instead of label identifiers

## Resources

<details>
  <summary>GraphQL request for ManageBoxes</summary>

```graphql
query BoxesForBoxesView($baseId: ID!, $filterInput: FilterBoxInput, $paginationInput: Int) {
  boxes(
    baseId: $baseId
    filterInput: $filterInput
    paginationInput: {first: $paginationInput}
  ) {
    totalCount
    pageInfo {
      hasNextPage
      __typename
    }
    elements {
      ... on Box {
        id
        labelIdentifier
        product {
          type
          ... on Product {
            id
            name
            type
            gender
            deletedOn
            category {
              id
              name
              __typename
            }
            __typename
          }
          __typename
        }
        numberOfItems
        size {
          ... on Size {
            id
            label
            __typename
          }
          __typename
        }
        weight
        monetaryValue
        weightDisplayUnit {
          symbol
        }
        state
        location {
          id
          name
          base {
            monetaryCurrencyCode
          }
        }
        tags {
          ... on Tag {
            id
            name
            color
            description
            type
            __typename
          }
          __typename
        }
        shipmentDetail {
          id
          shipment {
            id
            labelIdentifier
            __typename
          }
          __typename
        }
        qrCode {
          code
          __typename
        }
        comment
        createdOn
        lastModifiedOn
        deletedOn
        createdBy {
          id
          name
          __typename
        }
        lastModifiedBy {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}
```
</details>

<details>
  <summary>Equivalent SQL query</summary>

```sql
SELECT
    b.id,
    b.box_id,
    b.items,
    b.comments ,
    b.weight ,
    b.monetary_value ,
    units.symbol ,
    c.monetary_currency_code ,
    b.created  ,
    b.modified ,
    u.id,
    u.naam,
    um.id,
    um.naam,
    bs.label,
    p.id,
    p.name,
    p.standard_product_id,
    p.deleted,
    pc.id,
    pc.label ,
    s.id,
    s.label,
    l.id,
    l.label,
    -- duplicates box if multiple tags assigned
    tr.tag_id,
    t.label,
    t.color,
    t.description ,
    t.`type` ,
    sd.id,
    sh.id,
    qr.code
FROM stock b
JOIN locations l ON l.id = b.location_id
JOIN camps c ON c.id = l.camp_id
JOIN products p ON p.id = b.product_id
JOIN sizes s ON s.id = b.size_id
JOIN product_categories pc ON pc.id = p.category_id
JOIN box_state bs ON bs.id = b.box_state_id
LEFT OUTER JOIN cms_users u ON u.id = b.created_by
LEFT OUTER JOIN cms_users um ON um.id = b.modified_by
LEFT OUTER JOIN shipment_detail sd ON sd.box_id = b.id
LEFT OUTER JOIN shipment sh ON sh.id = sd.shipment_id
LEFT OUTER JOIN qr ON qr.id = b.qr_id
LEFT OUTER JOIN tags_relations tr ON tr.object_type = "Stock" AND tr.object_id = b.id
LEFT OUTER JOIN tags t ON t.id = tr.tag_id
LEFT OUTER JOIN units ON units.id = b.weight_display_unit_id
WHERE (b.deleted is null or not b.deleted)
AND l.camp_id = 3
;
```

</details>
