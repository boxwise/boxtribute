## Goal
Write the most time-efficient query to obtain correct count of boxes (and, ideally, their contained items count) that had their state changed from InStock to Donated in a certain timeframe in a single base.
The results shall group counts by box product (that's a simplification, actually it's product category), and target location ID.

## Context

We are building a statistics visualization that shows the boxes that have been moved otu of a warehouse (indicated by state change).

A box is a collection of items of the same product which is registered in a warehouse location.

Each location is part of one base. A base is an operational location of an aid organisation.

Boxes can move between locations of different bases (also of other organisations).

## Example data
### history table

Changes of box properties (state, location, product, number of items)

```
changedate | record_id | changes        | from_int | to_int
2023-01-01 |         9 | Record created |     NULL |   NULL
2023-01-01 |        12 | Record created |     NULL |   NULL
2023-01-01 |        20 | Record created |     NULL |   NULL
2023-01-01 |        25 | Record created |     NULL |   NULL
2023-01-10 |        12 | box_state_id   |        1 |      5
2023-01-10 |        12 | location_id    |        1 |      2
2023-01-15 |        20 | location_id    |        1 |      2
2023-01-15 |        20 | box_state_id   |        1 |      5
2023-02-11 |        12 | box_state_id   |        5 |      1
2023-02-11 |        12 | location_id    |        2 |      1
2023-03-01 |        12 | items          |       30 |     15
2023-03-19 |        25 | box_state_id   |        1 |      5
2023-03-19 |        25 | location_id    |        4 |      5
2023-03-21 |        12 | product_id     |        2 |      3
2023-03-30 |        12 | box_state_id   |        1 |      5
2023-03-30 |        12 | location_id    |        1 |      2
```

Explanation: Locations have a default box state that is assigned to a box moved into the location. On e.g. 2023-01-10, box 12 is moved from the InStock location 1 to the Donated location 2, as a result two rows are added to the history table (update of box state and box location). It can not be relied on the order of the two entries.
On 2023-02-11, the same box 12 is moved back, and later a couple of items are removed, and the product ID is updated.

### stock table

Holds current box properties (as of 2023-03-30):

```
id | location_id | product_id | items | box_state_id
 9 |           1 |          1 |    10 |            1
12 |           2 |          3 |    15 |            5
20 |           2 |          1 |    99 |            5
25 |           5 |          5 |    20 |            5
```

On 2023-01-01 it looked like this:

```
id | location_id | product_id | items | box_state_id
 9 |           1 |          1 |    10 |            1
12 |           1 |          2 |    30 |            1
20 |           1 |          1 |    99 |            1
25 |           4 |          4 |    20 |            1
```

### locations table

```
id | base_id | default_box_state_id
 1 |       1 |                    1
 2 |       1 |                    5
 3 |       1 |                    2
 4 |       2 |                    1
 5 |       2 |                    5
```

## Expected results

For the example data above, the following questions should return the results listed.

1. How many boxes (and items), grouped by product and target location, have been moved in base 1 in January 2023?
    - product ID 1, location ID 2: 1 box (99 items)
    - product ID 2, location ID 2: 1 box (30 items)
1. How many boxes (and items), grouped by product and target location, have been moved in base 1 in January&February 2023?
    - product ID 1, location ID 2: 1 box (99 items)
1. How many boxes (and items), grouped by product and target location, have been moved in base 1 in the first quarter of 2023?
    - product ID 1, location ID 2: 1 box (99 items)
    - product ID 3, location ID 2: 1 box (15 items)

What updates to the existing data structures (history / box table), and/or the business logic would leverage answering these questions?

### Extra

- How to find all boxes in my base that had their state changed from InStock to Donated, then back to InStock, and finally their product changed?

### Current output data format

Currently we propose a data format with columns for change date, target location ID, product ID, and number of moved boxes.
