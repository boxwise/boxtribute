# ADR: Database history

[Trello-card](https://trello.com/c/KQpZaHqC)

Decision Deadline: Feb 2023

Discussion Participants: @pylipp, @aerinsol, @haguesto, @vahidbazzaz

## Status

Proposed

## Context or Problem Statement

At the moment, we do not store relevant data about changes in stock, products, etc. (or, at least, in a rather convoluted way). Hence we cannot provide data insights about stock history to our partner which in turn would support them to analyse trends and communicate metrics to stakeholders.

## Decision Drivers

The technological solution for the problem requires

1. Simplicity: Our application is fairly small. We don't have capacities to neither dive into complex frameworks nor to maintain them nor to onboard new developers for them. The format of the recorded data should be clear such that querying and analysing data is straightforward.
1. Extensibility: it should not be tricky if different kinds of data need to be recorded, or if existing data schemas change
1. Robustness: we have to make sure that the data recorded represents the actual data at that point in time when it's read later
1. Security: every change to the DB should be recorded. Recorded data should not be modifiable
1. Disk space: is cheap and only of minor concern here
1. Integration in both dropapp and boxtribute 2.0

## Considered Options

There are five options with an impact on different levels of the software.

### Audit table

This is a record of changes, tracking change type, change time, change description, name of the table that the change was made in, ID of the changed record, and possibly a structured payload. The current `history` table implements this concept.
A variation is to have another table to record details for each change.

*Advantages*

- straightforward to see information about what *changed* at any point in time
- simple and extensible
- can be combined with database triggers to record any change on DB level

*Drawbacks*

- since the audit table records changes it becomes involved to derive the state of the database at a certain point in the past
- dealing with different data types requires additional effort when storing/reading change payload ("old"/"new" value)

### History tables (or: shadow tables)

For every relevant table create a history table with identical schema and an additional `effective` date column. On every change in a tracked table, a copy of the updated row is inserted as new record into the history table.

*Advantages*

- change date and user are recorded
- data versions are recorded and can be easily retrieved
- simple, especially querying (select by highest value of `effective` date column)
- separation of data and history
- can be combined with database triggers to record any change on DB level (no change in application code necessary then)
- history tables should be insert-only; they cannot be modified then

*Drawbacks*

- extensibility costs: every change in the original table requires an update in the corresponding history table
- the state of foreign key fields (i.e. tables that a history table depends on) has to be recorded as well to still be correct later
- since shadow tables record versions of data it becomes more involved to derive the actual change (i.e. the values before/after a change)

### Insert-only tables

Whenever a row would change, it is marked as inactive and copied into a new, active row with an `effective` date set.

*Advantages*

- no additional tables needed

*Drawbacks*

- no separation of responsibilities (relevant data vs. history)
- it's not possible to refer to such table entries using foreign keys (no referential integrity)

### Snapshots

Make copies of the database state at repeated times and archive them.

*Advantages*

- copying is simple
- no extension of business logic required

*Drawbacks*

- analysing is complicated: DB schema might have changed over time
- storage needs to be defined: in DB or as separate file
- precise changes are not recorded

### Event sourcing

Every change to the state of an application is captured in an event object. These event objects are themselves stored in the sequence they were applied for the same lifetime as the application state itself. The event log can be used to reconstruct past states.

*Advantages*

- powerful, scalable concept
- helpful for auditing and debugging (replaying events in a test environment)

*Drawbacks*

- complex extension of codebase required (twice for dropapp and v2 back-end)
- new developers might need to familiarize themselves with the concept first

## Decision

There are several popular audit logging techniques, but none of them serve every purpose. The most effective ones are often expensive, resource intensive, or performance degrading. Others are cheaper in terms of resources but are either incomplete, cumbersome to maintain, or require a sacrifice in design quality.

I propose to use history/shadow tables. It meets the requirements for simplicity and for knowing historical state. Since we don't have a lot of tables to be shadowed (stock, products, locations, people, tags, qr; maybe some for agreements/shipments), the maintenance cost is low.

Quoting the first reference below,

> If you only want to store logs for a few tables, shadow tables may be the most convenient option.

If we want to record data *changes* rather than *versions* of data, an audit table is more suitable.


### Background: Fact and dimension tables

Using a more theoretical approach, one can distinguish tables contents as

1. facts, e.g. number of items or number of boxes. Can be measured: sum, average, count, ...
1. dimensions, i.e. attributes describing facts (product, gender, size, location, tag)

For the second type, using history/shadow tables is appropriate, also since we're dealing with Slowly Changing Dimensions.

The first type however is the one we want to perform data analysis on. For that we want to avoid having to join tables in order to build the data to be analyzed but rather have all relevant data (also date information about changes) in denormalized form in a single table.

## Consequences

See advantages/drawbacks above.

We have to think about

- ~~whether we still want `created_at`, `modified_at`, etc. fields in tables that are shadowed~~ (keep for now because otherwise dropapp code needs to be modified)
- ~~whether to "convert" the current `history` table or to remove it~~ (keep for now because otherwise dropapp code needs to be modified)
- how to design the GraphQL API for data analysis

## References

### General comparison

This is one of the most helpful articles I found on the topic:

- https://vertabelo.com/blog/database-design-for-audit-logging/

### Audit tables

- https://stackoverflow.com/questions/201527/best-design-for-a-changelog-auditing-database-table/302311#302311

### History tables

- https://stackoverflow.com/a/17075789
- https://stackoverflow.com/questions/11294292/database-design-how-to-track-history/11294378#11294378

### Insert-only tables

- https://softwareengineering.stackexchange.com/a/156239

### Event sourcing

- https://martinfowler.com/eaaDev/EventSourcing.html

### Slowly changing dimensions

- https://en.wikipedia.org/wiki/Slowly_changing_dimension
