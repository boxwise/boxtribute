# GraphQL implementation of `Sizes`

## Status

accepted, implemented

## Context or Problem Statement

The API for `Sizes`, as well as their relations to `SizeRange`/`SizeGroup` and `Product` is not complete in the GraphQL schema and implementation.

We discussed mainly two options how to design the schema and how to implement it, with a variation of the second option (see `Considered Options` below).

## Decision Drivers

1. Fulfill needs of Frontend
2. Easy of use for API users
3. Closeness to current Database Structure


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
Option 2 also:
* doesn't require an additional mapping from Enum values to Human Friendly values.
* is the easiest to implement, also because it can be implemented elegantly without changes to the current DB structure
* can be extended in the future easier to Option 3 if that is needed later on (when we might want to enrich the size data, e.g. with size units so we would need a proper/‘complex’ type)

## Consequences

### Easier:
* Easy and elegant implementation
* Full flexibility for the actual size values

### More difficult:
* there is no auto complete feature in the GraphQL Console of all available Size values - the API user would have to run a small additional extra query to get all available SizeGroups and their Sizes
