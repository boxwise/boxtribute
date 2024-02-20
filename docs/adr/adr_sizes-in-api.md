# GraphQL implementation of `Sizes`

Discussion participants: [Roanna](https://github.com/orgs/boxwise/people/aerinsol), [Philipp](https://github.com/orgs/boxwise/people/pylipp), [Vahid](https://github.com/orgs/boxwise/people/vahidbazzaz), [Daniel](https://github.com/orgs/boxwise/people/spaudanjo)

## Status

accepted, implemented

## Context or Problem Statement

The API for `Sizes`, as well as their relations to `SizeRange`/`SizeGroup` and `Product` is not complete in the GraphQL schema and implementation.

We discussed mainly two options how to design the schema and how to implement it, with a variation of the second option (see `Considered Options` below).

## Decision Drivers

1. Fulfill needs of Frontend
2. Easy of use for API users
3. Closeness to current Database Structure
4. Complexity of implementation
5. Risk of lock-in / technical debt / needs of later refactorings
6. Whether or not design of business logic is reflective of real operations
7. Query performance



## Considered Options

### 1. Original plan: Sizes as GraphQL enums and having them stored as VARCHARS in DB

#### GraphQL schema

```
enum Size {
  EU_36, # GraphQL enums don't allow values which start with a number
  EU_42,
  ...,
  S,
  M,
  L,
  ...
}

type SizeRange {
  label: String!
  sizes: [Size!]!
}

type Product {
  ...
  sizeRange: SizeRange!
}


type Box {
  ...
  size: Size! # or potentially nullable, so => size: Size
}


type mutation {
  ...
  createBox(creationInput: BoxCreationInput): Box
}


input BoxCreationInput {
  ...
  size: Size! # or potentially nullable, so => size: Size
}
```


#### Database level

SizeRanges Table
- id: PK
- label: VARCHAR

Sizes Table
- id: PK
- sizeRangeId: FK to SizeRanges
- sizeValue: VARCHAR (the enum value representation value - these will naturally repeat, since the same enum value might be used across at least some size ranges)

Boxes Table
- size: VARCHAR (the enum value representation value - these will naturally repeat, since the same enum value will be used across a lot of boxes)
OR:
- sizeId: FK to Sizes


#### Pros/Cons

##### Pros
* more user friendliness / easier documentation when users interact with the API via the GraphQL explorer
* potentially a slightly better performance (but probably not making a difference for the User Experience)

##### Cons
* restrictions with the enum values (no leading numbers in the values)
* not sure how a extension in the future for size unit/dimensions would look like here
* requires more complexity both in the BE and FE because the enum values are different than the current DB size values (which are used by Dropapp) as well as the human readable names in the new FE (related to the
* even if we design the database in a way that saves the enum value for a box directly in the box/stock table (no FK and no resolving of a reference table), we most likely would have to keep the current database structure or change some Dropapp logic

### 2. Alternative: not using enums, but full types

#### GraphQL schema

```
type Size {
  id: ID!
  value: Int!
}

type SizeRange {
  label: String!
  sizes: [Size!]!
}

type Product {
  ...
  sizeRange: SizeRange!
}

type Box {
  ...
  size: Size! # or potentially nullable, so => size: Size
}

type mutation {
  ...
  createBox(creationInput: BoxCreationInput): Box
}

input BoxCreationInput {
  ...
  sizeId: ID!
}
```


#### Database level

SizeRanges Table
- id: PK
- label: VARCHAR

Sizes Table
- id: PK
- sizeRangeId: FK to SizeRanges
- sizeValue: VARCHAR

Boxes Table
- sizeId: FK to Sizes

#### Pros/Cons
(basically the inversion of the pros and cons of Option 1, but once more written down explicitly)

##### Pros
* no database changes needed for now
* because of the former point: less risky / easier to change later before the API is used heavily by partners
* can be extended in the future to also support units of sizes (see Option 3)
* full freedom regarding the naming of the size values (no mapping needed from Enum values to user friendly names)
##### Cons
* potentially a (very small) performance disadvantage compared to Option 1 (additional reference table when querying boxes)
* no auto complete/suggestions for the possible values when users interact with the API in the GraphQL explorer

### 3. Alternative: Variation of 2, to support more fine grained details about sizes (e.g. differentiating between non-numeric and numeric sizes, adding units to numeric sizes) - more for a potential extension of 2 for the future

#### GraphQL schema

```
type NonNumericSize {
  id: ID!
  value: String!
}

enum NumericSizeUnit {
  KG
  GR
  LBS
  …
}

type NumericSize {
  id: ID!
  value: Int!
  unit: NumericSizeUnit!
}

union Size = NonNumericSize | NumericSize

type SizeRange {
  label: String!
  sizes: [Size!]!
}

type Product {
  ...
  sizeRange: SizeRange!
}

type Box {
  ...
  size: Size! # or potentially nullable, so => size: Size
}

type mutation {
  ...
  createBox(creationInput: BoxCreationInput): Box
}

input BoxCreationInput {
  ...
  sizeId: ID!
}
```

#### Database level
Here we would have to follow some kind of polymorphic association pattern (or single table inheritance) for being able to connect the polymorphic Size type (which could be of type NonNumeric or Numeric) to Boxes and SizeRanges.


## Decision

We are going for Option 2. The Sizes use case is more of a typical plain-old-data case: there is no strong reason for making the concept a first class citizen in GraphQL, besides a bit more user friendliness regarding auto-completion when using the GraphQL console. In fact, there is also a shortcoming with the enum approach: there are naming constraints of GraphQL which don't allow enums to start wit numbers (which woudl affect a lot of Size values).

Also, there seem to be only a low risk of lock-in which couldn't be extended/overcome in the future if we wan’t to also add e.g. size units/dimensions.

Regarding the raised concern of a worse query performance of Option 2 because of the additional reference table: we don’t see high performance risks here since this is still in a normal query complexity level, we have an indexed foreign key and that this kind of operations is exactly what relational databases are made for.

All options reflect the currently known reality of operations of partner organizations - the differences are more in the concrete behavior of the API and the involved data structure.

Compared to Option 1, Option 2 also:
* doesn't require an additional mapping from Enum values to Human Friendly values
* keep the implementation less complex (both for initial time investment as well the maintenance complexity/effort); there are no changes to the current DB structure needed. At the moment we don't have signals that a more complex structure is necessary.
* can be extended in the future easier to Option 3 if that is needed later on (e.g. if we want to enrich the size data, e.g. with size units which would require a more 'complex' GraphQL type)



## Consequences

### Easier:
* Easy and elegant implementation
* Full flexibility for the actual size values

### More difficult:
* there is no auto complete feature in the GraphQL Console of all available Size values - the API user would have to run a small additional extra query to get all available SizeGroups and their Sizes
