## Goal

Write the most time-efficient query to obtain correct count of boxes (and, ideally, their contained items count) that had their state changed from InStock to Donated in a single base.
The results shall group counts by box product (that's a simplification, actually it's product category), target location ID and date of movement.

It is also possible to extend the existing data structures (history / box table) if it helps to speed up the query?

## Context

We are building a statistics visualization that shows the boxes that have been moved out of a warehouse (indicated by state change).

A box is a collection of items of the same product which is registered in a warehouse location and which has a state.

Each location is part of one base. A base is an operational location of an aid organisation.

Each location has a default box state, which is applied to a box when a box is moved to this location.

The box state change from InStock to Donated can only happen when a Box is moved from a location in the warehouse to an external location.

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
2023-03-30 |        12 | location_id    |        1 |      2 (without box state change)
2023-03-30 |        12 | location_id    |        1 |      2 (without box state change and base change)
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

### locations table

```
id | base_id | default_box_state_id
 1 |       1 |                    1
 2 |       1 |                    5
 3 |       1 |                    2
 4 |       2 |                    1
 5 |       2 |                    5
```

## Expected input

base_id

## Expected output

For the example data above, the following questions should return the results listed.

1. How many boxes (and items), grouped by product and target location, have been moved in base 1? - movedOn, product ID 1, location ID 2: 1 box (99 items) - product ID 2, location ID 2: 1 box (30 items) - product ID 2, location ID 2: -1 box (-30 items) - product ID 3, location ID 2: 1 box (15 items)
   Question: How do we return the data if a box was moved back from Donated to InStock?

### Issues to consider when writing the query

- Box can moved between locations of different bases, but we only want to count the box if the transition from InStock to Donated happened in the base of the query input
- items being taken out of a box. We want to count the items that were in the box when the box was moved from InStock to Donated
- product_id changed for a box. We want to count the items that were in the box when the box was moved from InStock to Donated

- How to find all boxes in my base that had their state changed from InStock to Donated, then back to InStock, and finally their product changed?

### Current output data format

Currently we propose a data format with columns for change date, target location ID, product ID, and number of moved boxes.
