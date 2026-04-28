# GraphQL Backend Performance Analysis — `BOXES_FOR_BOXESVIEW_QUERY`

## 1. Query Definition and Field Inventory

**Frontend location:** `front/src/views/Boxes/BoxesView.tsx:96–115`

```graphql
query BoxesForBoxesView($baseId: ID!, $filterInput: FilterBoxInput, $paginationInput: Int) {
  boxes(
    baseId: $baseId
    filterInput: $filterInput
    paginationInput: { first: $paginationInput }
  ) {
    totalCount
    pageInfo {
      hasNextPage
    }
    elements {
      ...BoxesQueryElementField
    }
  }
}
```

The `BoxesQueryElementField` fragment (`front/src/views/Boxes/BoxesView.tsx:48–94`) requests
these fields per box:

| Field | Resolver / note |
|---|---|
| `id`, `labelIdentifier`, `numberOfItems`, `state`, `comment`, `createdOn`, `lastModifiedOn`, `deletedOn` | Direct Peewee model attributes — no extra queries |
| `product.{type, name, gender, deletedOn}` | `ProductBasicFields` fragment (`graphql/fragments.ts:25–37`) |
| `product.category.{id, name}` | Inside `ProductBasicFields` |
| `size.{id, label}` | `SizeBasicFields` fragment (`graphql/fragments.ts:55–59`) |
| `location.{id, name}` | Inline field |
| `tags.{id, name, color, description, type, deletedOn, createdOn, lastModifiedOn, lastUsedOn}` | `TagBasicFields` fragment (`front/src/queries/fragments.ts:29–40`) |
| `shipmentDetail.id`, `shipmentDetail.shipment.{id, labelIdentifier}` | Inline fields |
| `qrCode.code` | Inline field |
| `createdBy.{id, name}`, `lastModifiedBy.{id, name}` | Inline fields |
| `boxes.totalCount` | Full `COUNT(*)` query |
| `boxes.pageInfo.hasNextPage` | Existence-probe `SELECT 1 … LIMIT 1` |

---

## 2. Root Resolver Chain

**Root resolver:** `resolve_boxes` — `back/boxtribute_server/business_logic/warehouse/box/queries.py:24–44`

```python
@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=base_id)

    selection = Box.select().join(
        Location,
        on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted_on == 0) | (Box.deleted_on.is_null()))
        ),
    )
    filter_condition, selection = derive_box_filter(filter_input, selection=selection)

    return load_into_page(
        Box,
        filter_condition,
        selection=selection,
        order_by_field=Box.last_modified_on.desc(),
        pagination_input=pagination_input,
    )
```

`load_into_page` (`back/boxtribute_server/graph_ql/pagination.py:189–214`) triggers
**three separate SQL queries** for a single `boxes(…)` call:

| # | SQL | Code location |
|---|---|---|
| Q1 | `SELECT stock.* FROM stock JOIN locations WHERE … ORDER BY modified DESC LIMIT N+1` | `selection.where(…).order_by(…).limit(…)` |
| Q2 | `SELECT COUNT(*) FROM stock JOIN locations WHERE …` | `_compute_total_count()`, `pagination.py:158` |
| Q3 | `SELECT 1 FROM stock … WHERE id < first_element_id LIMIT 1` | `cursor.has_next_previous_page()`, `pagination.py:96` |

---

## 3. Box Field Resolvers and DataLoader Audit

**Resolver file:** `back/boxtribute_server/business_logic/warehouse/box/fields.py`  
**DataLoader file:** `back/boxtribute_server/graph_ql/loaders.py`

| GraphQL field | Resolver | DataLoader | Batching behaviour |
|---|---|---|---|
| `qrCode` | `resolve_box_qr_code` (sync, line 12) | `QrCodeLoader` → `SimpleDataLoader` | ✅ 1 query for all QR IDs |
| `tags` | `resolve_box_tags` (sync, line 16) | `TagsForBoxLoader` (lines 209–230) | ✅ 1 query: `TagsRelation JOIN Tag WHERE object_id IN (…)` |
| `tag.lastUsedOn` | `resolve_tag_last_used_on` (`tag/fields.py:30`) | `TagLastUsedOnLoader` (lines 718–731) | ✅ 1 query: `MAX(created_on) GROUP BY tag_id WHERE tag_id IN (…)` |
| `product` | `resolve_box_product` (**async**, line 28) | `ProductLoader` → `SimpleDataLoader` | ✅ 1 query — see async note below |
| `product.category` | `resolve_product_product_category` (`product/fields.py:10`) | `ProductCategoryLoader` | ✅ 1 query for distinct category IDs |
| `size` | `resolve_box_size` (sync, line 41) | `SizeLoader` → `SimpleDataLoader` | ✅ 1 query |
| `location` | `resolve_box_location` (**async**, line 47) | `LocationLoader` → `SimpleDataLoader` | ✅ 1 query |
| `shipmentDetail` | `resolve_box_shipment_detail` (sync, line 80) | `ShipmentDetailForBoxLoader` (line 549) | ✅ 1 query |
| `shipmentDetail.shipment` | `resolve_shipment_detail_shipment` (`shipment/fields.py:211`) | `ShipmentLoader` (line 135) | ⚠️ See Culprit #4 |
| `shipment.labelIdentifier` | `resolve_shipment_label_identifier` (**async**, `shipment/fields.py:19`) | `BaseLoader` (×2) | ✅ 2 queries (source + target bases) |
| `createdBy`, `lastModifiedBy` | `resolve_box_created_by` / `_last_modified_by` (lines 84–91) | `UserLoader` → `SimpleDataLoader` | ✅ 1 query for all user IDs |

**Note on async resolvers:** `resolve_box_product` and `resolve_box_location` both `await`
inside their coroutine bodies. Batching still works correctly because graphql-core 3 runs all
list-item resolvers concurrently, meaning all 1 000 `loader.load()` calls are submitted
synchronously before any `await` suspends a coroutine — before aiodataloader's
`loop.call_soon`-scheduled dispatch fires.

**Total SQL queries for one well-batched request with 1 000 boxes: ~15.**

---

## 4. Identified Performance Culprits

### Culprit #1 — Missing index on `stock.modified` *(CRITICAL)*

**Files:** `back/boxtribute_server/models/definitions/box.py`, `back/init.sql:2265–2310`

The main box query orders by `Box.last_modified_on.desc()` (i.e., `ORDER BY stock.modified DESC`).
From `init.sql` the `stock` table has:

```sql
KEY `location_id` (`location_id`),
KEY `product_id`  (`product_id`),
KEY `box_state_id` (`box_state_id`),
-- NO KEY on `modified` !
```

There is **no index on `stock.modified`**. For a base with N boxes MySQL must:

1. Filter rows by joining `locations` (uses the `location_id` index).
2. Materialise **all N matching rows** in a temporary structure.
3. Sort all N rows by `modified DESC` (**filesort — O(N log N)**).
4. Return the first 51.

This single missing index is the most likely cause of the >20 s response time.

---

### Culprit #2 — `COUNT(*)` query on every page load *(HIGH)*

**File:** `back/boxtribute_server/graph_ql/pagination.py:158–162`

```python
def _compute_total_count(*conditions, selection):
    if conditions:
        selection = selection.where(*conditions)
    return selection.count()   # → SELECT COUNT(*) FROM stock JOIN locations WHERE …
```

This runs unconditionally for every `boxes(…)` request regardless of whether the client
actually selected `totalCount`. For 10 000 boxes it must scan all rows.

---

### Culprit #3 — Frontend fires 4–5 parallel requests simultaneously on mount *(HIGH)*

**File:** `front/src/views/Boxes/BoxesView.tsx:207–268`

On initial mount the component fires:

1. One request via `useBackgroundQuery` (line 207) — PAGE_SIZE=50 boxes, current filter.
2. Three state-filtered requests in `useEffect` (lines 240–250) — one each for InStock, Donated, Scrap.
3. One unfiltered full request in `useEffect` (lines 253–266) — all states, no pagination limit.

All five fire within milliseconds. Each triggers ~15 SQL queries on the backend (**~75 total**
per page load). Each request runs `asyncio.run()`, which creates a new event loop and a fresh
set of DataLoader instances — no sharing between concurrent requests.

---

### Culprit #4 — `ShipmentLoader` ignores `keys`, fetches ALL accessible shipments *(MEDIUM)*

**File:** `back/boxtribute_server/graph_ql/loaders.py:135–144`

```python
class ShipmentLoader(DataLoader):
    async def batch_load_fn(self, keys):
        shipments = {
            s.id: s
            for s in Shipment.select().orwhere(
                authorized_bases_filter(Shipment, base_fk_field_name="source_base_id"),
                authorized_bases_filter(Shipment, base_fk_field_name="target_base_id"),
            )
        }
        return [shipments.get(i) for i in keys]
```

The `keys` parameter (the specific shipment IDs referenced by the 1 000 boxes) is completely
ignored. The loader fetches **every shipment accessible to the user**. For organisations with
hundreds of historical shipments this is a wasted table scan.

---

### Culprit #5 — Pagination cursor keyed on `Box.id` but ordered by `Box.modified` *(MEDIUM/CORRECTNESS)*

**File:** `back/boxtribute_server/graph_ql/pagination.py:96–109`

The default cursor evaluates to `WHERE stock.id > 0`, but results are ordered by
`modified DESC`. The `has_previous_page` check then runs:

```sql
SELECT 1 FROM stock … WHERE id < first_element.id LIMIT 1
```

This checks "does any box have a smaller primary key?" — not "are there any boxes that come
earlier in the `modified DESC` ordering?" This is both a **correctness bug** and a wasted
extra round-trip SQL query per page load.

---

### Culprit #6 — QrCode loaded via a separate DataLoader instead of JOIN *(LOW)*

**Files:** `back/boxtribute_server/business_logic/warehouse/box/fields.py:12–13`,
`back/boxtribute_server/graph_ql/loaders.py:95–97`

`qr_id` is already a column on `stock`. The main box SELECT could bring in `qr.code` via a
`LEFT OUTER JOIN qr ON stock.qr_id = qr.id`, removing one SQL round-trip. Instead a separate
`SELECT * FROM qr WHERE id IN (1 000 IDs)` is issued.

---

### Culprit #7 — `asyncio.run()` creates a fresh event loop per Flask request *(LOW)*

**File:** `back/boxtribute_server/graph_ql/execution.py:55–110`

`asyncio.run()` creates and destroys a complete event loop on every request and allocates
25+ DataLoader instances. This is correct for isolation but adds allocation overhead that
compounds with simultaneous requests.

---

## 5. Solutions, Ranked by ROI

---

### Solution A — Add a `modified` index on the `stock` table

**Complexity: LOW | Impact: HIGH**

```sql
-- Option 1: single-column index
CREATE INDEX stock_modified_idx ON stock (modified);

-- Option 2 (preferred): composite covering index for the common filtering pattern
-- (filter by location_id via the JOIN, then walk in modified order without filesort)
CREATE INDEX stock_location_modified_idx ON stock (location_id, modified);
```

This eliminates the full filesort for every `boxes` query. With a composite
`(location_id, modified)` index MySQL can filter by location and traverse in
`modified DESC` order in a single index scan.

---

### Solution B — Reduce the number of parallel frontend requests

**Complexity: LOW | Impact: HIGH**

**Option 1 — Eliminate preloading entirely.**  
The main `useBackgroundQuery` already fetches the initial page. Remove the `useEffect`
preloading loop entirely. When the user changes filters Apollo fetches new data on demand.

**Option 2 — Sequence the preloads with staggered delays** so they don't all hit the
database at the same time. The critical "show something fast" fetch (full boxes, no filter)
runs first; the state-specific preloads follow with short delays so the server has time to
finish the primary request before each new one begins.

```tsx
// front/src/views/Boxes/BoxesView.tsx  — replace the useEffect starting at line 217

useEffect(() => {
  if (hasExecutedInitialFetchOfBoxes.current) {
    return;
  }

  const states = ["InStock", "Donated", "Scrap"] satisfies Partial<BoxState>[];
  const stateFilterValues: string[] =
    (tableConfig.getColumnFilters().find((f) => f.id === "state")?.value as string[]) ?? [];

  // Step 1: fire the full "all boxes" background fetch first.
  // This is the most important request and gets a head start.
  apolloClient
    .query({
      query: BOXES_FOR_BOXESVIEW_QUERY,
      variables: prepareBoxesForBoxesViewQueryVariables(baseId, tableConfig.getColumnFilters()),
      fetchPolicy: "network-only",
    })
    .then(({ data, errors }) => {
      if ((errors?.length || 0) === 0 && data?.boxes?.elements) {
        hasExecutedInitialFetchOfBoxes.current = true;
      }
    })
    .finally(() => {
      setIsBackgroundFetchOfBoxesLoading(false);
    });

  // Step 2: stagger each state-specific preload 2 seconds apart,
  // starting 1 second after the primary request above so the server
  // has time to start processing it before new work arrives.
  const INITIAL_DELAY_MS = 1_000;
  const STAGGER_MS = 2_000;

  const timers: ReturnType<typeof setTimeout>[] = [];

  states.forEach((state, index) => {
    const stateId = boxStateIds[state];
    if (stateId && stateFilterValues.includes(stateId)) {
      // Table is already filtered to this state — skip.
      return;
    }

    const delay = INITIAL_DELAY_MS + index * STAGGER_MS;
    const timer = setTimeout(() => {
      apolloClient.query({
        query: BOXES_FOR_BOXESVIEW_QUERY,
        variables: {
          baseId,
          filterInput: { states: [state] },
          paginationInput: PAGE_SIZE,
        },
        fetchPolicy: "network-only",
      });
    }, delay);

    timers.push(timer);
  });

  // Clean up any pending timers if the component unmounts before they fire.
  return () => timers.forEach(clearTimeout);

  // only on initial mount, so no dependencies needed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Key changes vs. the original:

- The primary full-boxes fetch fires **immediately** and is awaited for the `hasExecutedInitialFetchOfBoxes` flag.
- The three state-specific preloads are each delayed by 1 s, 3 s, and 5 s respectively via `setTimeout`, spreading their DB load over several seconds instead of instantaneously.
- A cleanup function cancels any pending timers on component unmount to avoid state updates on an unmounted component.

**Option 3 — Consolidate into a single query.**  
Send one request covering all three states and split results in the Apollo cache:

```tsx
apolloClient.query({
  query: BOXES_FOR_BOXESVIEW_QUERY,
  variables: {
    baseId,
    filterInput: { states: ["InStock", "Donated", "Scrap"] },
    paginationInput: PAGE_SIZE,
  },
  fetchPolicy: "network-only",
});
```

This reduces 3 state-specific requests to 1, at the cost of mixing states in a single
Apollo cache entry (may require cache policy adjustments).

---

### Solution C — Fix `ShipmentLoader` to filter by keys

**Complexity: LOW | Impact: MEDIUM**

```python
# back/boxtribute_server/graph_ql/loaders.py  — ShipmentLoader.batch_load_fn

class ShipmentLoader(DataLoader):
    async def batch_load_fn(self, keys):
        shipments = {
            s.id: s
            for s in Shipment.select().where(
                Shipment.id << keys,          # ← add this: only fetch the needed IDs
                authorized_bases_filter(Shipment, base_fk_field_name="source_base_id")
                | authorized_bases_filter(Shipment, base_fk_field_name="target_base_id"),
            )
        }
        return [shipments.get(i) for i in keys]
```

Changes the load from "all accessible shipments" to "only the shipments referenced by these
box IDs." One-line fix with no schema or API change.

---

### Solution D — Make `totalCount` optional / reduce its cost

**Complexity: MEDIUM | Impact: MEDIUM**

`_compute_total_count` runs `SELECT COUNT(*) …` unconditionally on every page request
regardless of whether the client selected `totalCount` in their query. Three approaches are
described below, from simplest to most complex.

#### D-1: Skip the count when `totalCount` is not in the selection set

The Ariadne `info` object exposes the parsed GraphQL query as `info.field_nodes`. Using the
`graphql-core` AST helpers it is possible to check, from inside the `resolve_boxes` root
resolver, whether the client actually requested `totalCount`. If not, pass a sentinel value
(`-1` or `None`) and skip the `COUNT(*)` altogether.

```python
# back/boxtribute_server/business_logic/warehouse/box/queries.py

from graphql import FieldNode
from ariadne import QueryType

from ....authz import authorize
from ....graph_ql.filtering import derive_box_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.box import Box
from ....models.definitions.location import Location

query = QueryType()


def _client_requested_total_count(info) -> bool:
    """Return True if the client's GraphQL selection set includes `totalCount`
    on the boxes field. Inspects the parsed AST via the Ariadne/graphql-core
    info object so no schema changes are needed.
    """
    for field_node in info.field_nodes:
        if field_node.selection_set is None:
            continue
        for selection in field_node.selection_set.selections:
            if isinstance(selection, FieldNode) and selection.name.value == "totalCount":
                return True
    return False


@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None, info):
    authorize(permission="stock:read", base_id=base_id)

    selection = Box.select().join(
        Location,
        on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted_on == 0) | (Box.deleted_on.is_null()))
        ),
    )
    filter_condition, selection = derive_box_filter(filter_input, selection=selection)

    return load_into_page(
        Box,
        filter_condition,
        selection=selection,
        order_by_field=Box.last_modified_on.desc(),
        pagination_input=pagination_input,
        compute_total_count=_client_requested_total_count(info),  # ← new flag
    )
```

```python
# back/boxtribute_server/graph_ql/pagination.py  — updated generate_page and load_into_page

def _compute_total_count(*conditions, selection):
    """Compute total count, taking given conditions and model selection into account."""
    if conditions:
        selection = selection.where(*conditions)
    return selection.count()


def generate_page(*conditions, elements, cursor, selection, compute_total_count=True, **page_info_kwargs):
    """Return a GraphQL Page type wrapping the given elements, and including appropriate
    page info. If compute_total_count is False, total_count is returned as -1 to
    signal that the value was deliberately not computed.
    """
    page_info = _generate_page_info(
        *conditions,
        elements=elements,
        cursor=cursor,
        selection=selection,
        **page_info_kwargs,
    )
    page = {
        "page_info": page_info,
        "total_count": (
            _compute_total_count(*conditions, selection=selection)
            if compute_total_count
            else -1        # sentinel: client did not ask for totalCount
        ),
    }

    if cursor.forwards:
        page["elements"] = elements[:-1] if page_info.has_next_page else elements
    else:
        page["elements"] = elements[1:] if page_info.has_previous_page else elements

    return page


def load_into_page(
    model,
    *conditions,
    selection=None,
    order_by_field=None,
    pagination_input,
    compute_total_count=True,   # ← new parameter
):
    cursor, limit = pagination_parameters(pagination_input)
    pagination_condition = cursor.pagination_condition(model)

    if selection is None:
        selection = model.select()
    query_result = (
        selection.where(pagination_condition, *conditions)
        .order_by(order_by_field or model.id)
        .limit(limit + 1)
    )
    return generate_page(
        *conditions,
        elements=list(query_result.iterator()),
        cursor=cursor,
        limit=limit,
        selection=selection,
        compute_total_count=compute_total_count,  # ← forwarded
    )
```

**Pros:** Zero schema change. Eliminates the `COUNT(*)` when the client does not ask for it.  
**Cons:** Requires threading `info` through `resolve_boxes` → `load_into_page` → `generate_page`.
The `BOXES_FOR_BOXESVIEW_QUERY` currently *does* select `totalCount`, so this only helps if
the query is later updated to drop the field — or if other callers of `boxes(…)` don't need it.

---

#### D-2: Use `INFORMATION_SCHEMA` or `SHOW TABLE STATUS` for an approximate count

MySQL keeps a running estimate of row counts in its storage engine statistics. This estimate
is fast (O(1)) and requires no table scan, but is approximate (within a few percent for
InnoDB).

```python
# back/boxtribute_server/graph_ql/pagination.py

from ..db import execute_sql


def _approximate_total_count(selection) -> int:
    """Return an approximate row count for the model underlying `selection`.
    Uses MySQL's internal statistics — O(1) but may be off by a small percentage.
    Only suitable when the client can tolerate an approximate value.
    """
    table_name = selection.model._meta.table_name
    rows = execute_sql(
        query="SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES "
              "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s",
        table_name,
    )
    if rows:
        return rows[0]["TABLE_ROWS"]
    return 0
```

```python
# Usage in generate_page — replace _compute_total_count with _approximate_total_count
# when an approximation is acceptable:

page = {
    "page_info": page_info,
    "total_count": _approximate_total_count(selection),   # ← fast, approximate
}
```

**Important caveats:**
- InnoDB TABLE_ROWS is an estimate; it can be off by 20–50 % after many inserts/deletes.
  Run `ANALYZE TABLE stock;` periodically to refresh the statistics.
- The estimate does **not** account for active filters (e.g., `filterInput: { states: ["InStock"] }`),
  so it will always reflect the full-table count, not the filtered count. This makes it
  suitable only for the unfiltered case or as a rough indicator ("~4 000 boxes").
- The BoxesView currently shows the count to users, so surfacing an approximate count may be
  confusing without a UI indicator (e.g., "~4 000 boxes").

**Pros:** Essentially free — no table scan.  
**Cons:** Not filter-aware; approximate; may confuse users.

---

#### D-3: Cache the count per base with a short TTL

Run the real `COUNT(*)` but cache its result so subsequent requests within the same time
window reuse it without hitting the database. Flask's `g` object is per-request, so a
slightly longer-lived store is needed. The example below uses a simple in-process dict with
a TTL; for a multi-process deployment a shared cache (Redis, Memcached) is preferable.

```python
# back/boxtribute_server/graph_ql/pagination.py

import time
from typing import Any

# Simple in-process TTL cache.
# For multi-process / multi-instance deployments, replace with Redis or Memcached.
_count_cache: dict[Any, tuple[int, float]] = {}
_COUNT_TTL_SECONDS = 30


def _cached_total_count(*conditions, selection, cache_key) -> int:
    """Return a cached COUNT(*) result, or compute and cache it on a miss.

    `cache_key` should uniquely identify the query (e.g., a (base_id, filter_hash) tuple).
    The count is re-computed from the database when the cached value is older than
    _COUNT_TTL_SECONDS.
    """
    cached = _count_cache.get(cache_key)
    now = time.monotonic()
    if cached is not None:
        value, expires_at = cached
        if now < expires_at:
            return value

    # Cache miss or expired — compute the real count.
    value = _compute_total_count(*conditions, selection=selection)
    _count_cache[cache_key] = (value, now + _COUNT_TTL_SECONDS)
    return value
```

```python
# back/boxtribute_server/business_logic/warehouse/box/queries.py  — updated resolve_boxes

import hashlib, json

@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=base_id)

    selection = Box.select().join(
        Location,
        on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted_on == 0) | (Box.deleted_on.is_null()))
        ),
    )
    filter_condition, selection = derive_box_filter(filter_input, selection=selection)

    # Build a cache key from base_id + serialised filter to ensure filter-specific
    # counts are cached independently.
    filter_hash = hashlib.md5(
        json.dumps(filter_input or {}, sort_keys=True).encode()
    ).hexdigest()
    count_cache_key = (int(base_id), filter_hash)

    return load_into_page(
        Box,
        filter_condition,
        selection=selection,
        order_by_field=Box.last_modified_on.desc(),
        pagination_input=pagination_input,
        count_cache_key=count_cache_key,   # ← new argument
    )
```

```python
# back/boxtribute_server/graph_ql/pagination.py  — updated generate_page / load_into_page

def generate_page(
    *conditions,
    elements,
    cursor,
    selection,
    count_cache_key=None,   # ← new: if provided, use the cache
    **page_info_kwargs,
):
    page_info = _generate_page_info(
        *conditions,
        elements=elements,
        cursor=cursor,
        selection=selection,
        **page_info_kwargs,
    )

    if count_cache_key is not None:
        total_count = _cached_total_count(
            *conditions,
            selection=selection,
            cache_key=count_cache_key,
        )
    else:
        total_count = _compute_total_count(*conditions, selection=selection)

    page = {
        "page_info": page_info,
        "total_count": total_count,
    }

    if cursor.forwards:
        page["elements"] = elements[:-1] if page_info.has_next_page else elements
    else:
        page["elements"] = elements[1:] if page_info.has_previous_page else elements

    return page


def load_into_page(
    model,
    *conditions,
    selection=None,
    order_by_field=None,
    pagination_input,
    count_cache_key=None,   # ← forwarded to generate_page
):
    cursor, limit = pagination_parameters(pagination_input)
    pagination_condition = cursor.pagination_condition(model)

    if selection is None:
        selection = model.select()
    query_result = (
        selection.where(pagination_condition, *conditions)
        .order_by(order_by_field or model.id)
        .limit(limit + 1)
    )
    return generate_page(
        *conditions,
        elements=list(query_result.iterator()),
        cursor=cursor,
        limit=limit,
        selection=selection,
        count_cache_key=count_cache_key,
    )
```

**Pros:** Returns the exact count; only runs the `COUNT(*)` once per `_COUNT_TTL_SECONDS`
window for a given (base, filter) pair. Works correctly with filters.  
**Cons:** Count may be stale by up to the TTL. In-process cache does not survive a process
restart or scale out across multiple workers — use Redis/Memcached for production. Requires
cache invalidation when boxes are created/deleted (or accept the TTL-based staleness).

---

### Solution E — Fix cursor-based pagination to use `modified` as the ordering key

**Complexity: MEDIUM | Impact: MEDIUM (correctness + removes the extra `has_previous_page` query)**

The `Cursor` class encodes `Box.id` for pagination conditions, but results are sorted by
`modified DESC`. This is a **correctness bug**: `has_previous_page` checks `id < first_element.id`
instead of checking whether any box has a more-recent `modified` timestamp.

The fix is to encode both `(modified, id)` in the cursor and compare against both in the
`WHERE` clause. The composite key makes pagination stable even when multiple boxes share the
same `modified` timestamp.

---

### Solution F — Join `QrCode` into the main Box SELECT

**Complexity: LOW | Impact: LOW**

```python
# back/boxtribute_server/business_logic/warehouse/box/queries.py

from ....models.definitions.qr_code import QrCode
from peewee import JOIN

@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=base_id)

    selection = (
        Box.select(Box, QrCode)              # ← include QrCode columns
        .join(Location, on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted_on == 0) | (Box.deleted_on.is_null()))
        ))
        .switch(Box)
        .join(QrCode, JOIN.LEFT_OUTER,       # ← join QR codes (nullable)
              on=(Box.qr_code == QrCode.id))
    )
    ...
```

With `qr_code` pre-fetched on the box object, `resolve_box_qr_code` can return
`box_obj.qr_code` directly without going through the DataLoader — eliminating one SQL
round-trip per request.

---

### Solution G — Replace Peewee with an async-compatible ORM *(long-term)*

**Complexity: HIGH | Impact: HIGH**

Peewee is a synchronous ORM. All its SQL calls block the thread while inside an async event
loop. A truly async ORM (e.g., SQLAlchemy 2 async + `aiomysql`) would allow multiple
DataLoader batch queries to genuinely overlap in I/O. This is a significant refactoring
effort but would benefit the entire backend, not just the boxes query.

---

## 6. Quick Wins Summary

| Action | File(s) | Effort | Expected Improvement |
|---|---|---|---|
| **Add index on `stock.modified`** (or composite `location_id, modified`) | DB migration / `init.sql` | 30 min | Likely 5–15× speedup on the main box SELECT |
| **Reduce frontend parallel requests** (Option 1: remove preloading; Option 2: stagger with delays) | `BoxesView.tsx:217–268` | 1–2 h | ~80 % reduction in backend load on page mount |
| **Fix `ShipmentLoader` to use `keys`** | `loaders.py:135–144` | 15 min | Eliminates full-shipments scan per request |
| **Skip `COUNT(*)` when `totalCount` not selected** (Solution D-1) | `pagination.py`, `box/queries.py` | 2 h | Eliminates one full table scan per request |
| **Cache `COUNT(*)` per base/filter** (Solution D-3) | `pagination.py`, `box/queries.py` | 3 h | Same benefit as D-1 for existing callers that do select `totalCount` |
| **Join `qr` into the main box SELECT** | `box/queries.py`, `box/fields.py` | 1 h | Eliminates 1 DB round-trip per request |
