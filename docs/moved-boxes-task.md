## Goal

Write the most time-efficient query to obtain correct count of boxes (and, ideally, their contained items count) that have been moved out of warehouses of certain base.

The results shall group counts by box product, target location ID and date of movement.

It is possible to extend the existing data structures (history / box table) if it helps to speed up the query.

## Context

We are building a visualization that shows statistics about boxes that have been moved out of warehouses of a certain base within a certain time frame.

A box is a collection of items of the same product which is registered in a location. A box has a state.

Each location is part of one base. A base is an operational site of an aid organisation. Each location has a default box state, which is applied to a box when a box is moved to this location. Example: Organisation BoxCare operates in base Athens. The base consists of the locations "Warehouse Adults", "Warehouse Kids", and "Shop". The former two are locations with default box state `InStock`, the latter is an "outgoing" location with default box state `Donated`.

For the **Goal of the task it is relevant to know** that "moving a box out of a warehouse" means: moving a box from a location with default box state `InStock` to a location with default box state `Donated`. This is the only scenario when the box state change from `InStock` to `Donated` can occur.

Boxes can move between locations of different bases (also of other organisations).

## Example data

### history table

Changes of box properties (state, location, product, number of items)

```
changedate          | record_id | changes        | from_int | to_int
2023-01-01 10:00:00 |         9 | Record created |     NULL |   NULL
2023-01-01 11:00:00 |        12 | Record created |     NULL |   NULL
2023-01-01 12:00:00 |        20 | Record created |     NULL |   NULL
2023-01-01 13:00:00 |        25 | Record created |     NULL |   NULL
2023-01-01 14:00:00 |        26 | Record created |     NULL |   NULL
2023-01-10 10:00:00 |        12 | box_state_id   |        1 |      5   # box is moved to `Donated` location within base 1
2023-01-10 10:00:00 |        12 | location_id    |        1 |      2
2023-01-15 20:20:00 |        20 | location_id    |        1 |      2   # box is moved to `Donated` location within base 1
2023-01-15 20:20:00 |        20 | box_state_id   |        1 |      5
2023-02-11 11:00:40 |        12 | box_state_id   |        5 |      1   # box is moved back to `InStock` location within base 1
2023-02-11 11:00:40 |        12 | location_id    |        2 |      1
2023-03-01 09:00:00 |        12 | items          |       30 |     15   # 15 items are removed from the box
2023-03-19 12:34:56 |        25 | box_state_id   |        1 |      5   # box is moved to `Donated` location within base 2
2023-03-19 12:34:56 |        25 | location_id    |        4 |      5
2023-03-21 08:00:00 |        12 | product_id     |        2 |      3   # box product is changed
2023-03-25 19:00:00 |         9 | location_id    |        1 |      4   # box is moved to `InStock` location of another base (2)
2023-03-27 23:00:00 |        26 | location_id    |        4 |      6   # box is moved to `InStock` location within base 2
2023-03-30 15:00:51 |        12 | box_state_id   |        1 |      5
2023-03-30 15:00:51 |        12 | location_id    |        1 |      2   # box is moved to `Donated` location within base 1
```

Explanation: Locations have a default box state that is assigned to a box moved into the location. On e.g. 2023-01-10, box 12 is moved from the `InStock` location 1 to the `Donated` location 2, as a result two rows are added to the history table (update of box state and box location). It can not be relied on the order of the two entries.
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
 6 |       2 |                    1
```

### box_state table

```
id | label
 1 | Instock
 2 | Lost
 3 | MarkedForShipment
 4 | Receiving
 5 | Donated
 6 | Scrap
 7 | InTransit
 8 | NotDelivered
```

## Query input

`base_id`: data shall be returned about all box movements within locations of the base with given ID

## Expected output

For the example data above, the following question should return the results listed.

How many boxes (and items), grouped by product and target location, have been moved in base 1?

Currently we propose a data format with columns for change date, target location ID, product ID, and number of moved boxes and items.

```
moved_on   | product_id | target_location_id | box_count | items_count
2023-01-10 |          2 |                  2 |         1 |          30
2023-01-15 |          1 |                  2 |         1 |          99
2023-02-11 |          2 |                  2 |        -1 |         -30
2023-03-30 |          3 |                  2 |         1 |          15
```

### Issues to consider when writing the query

- Box can moved between locations of different bases, but we only want to count the box if the transition from `InStock` to `Donated` happened in the base given in the query input
- items being taken out of a box: We want to count the items that were in the box at the time of the movement
- box product changed: We want to count the items that were in the box at the time of the movement
- how to take into account if a box was moved back from a `Donated` to an `InStock` location`?

- How to find all boxes in my base that had their state changed from InStock to Donated, then back to InStock, and finally their product changed?
