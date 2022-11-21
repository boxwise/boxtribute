import { gql } from "@apollo/client";

export const PRODUCT_FIELDS_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    gender
    category {
      name
    }
    sizeRange {
      label
      sizes {
        id
        label
      }
    }
  }
`;

export const PRODUCT_BASIC_FIELDS_FRAGMENT = gql`
  fragment ProductBasicFields on Product {
    name
    gender
  }
`;

export const TAG_FIELDS_FRAGMENT = gql`
  fragment TagFields on Tag {
    id
    name
    color
  }
`;

export const TAG_OPTIONS_FRAGMENT = gql`
  fragment TagOptions on Tag {
    value: id
    label: name
    color
  }
`;

export const LOCATION_FIELDS_FRAGMENT = gql`
  fragment LocationFields on Location {
    __typename
    ... on ClassicLocation {
      defaultBoxState
    }
    id
    name
  }
`;

export const SIZE_FIELDS_FRAGMENT = gql`
  fragment SizeFields on Size {
    id
    label
  }
`;

export const DISTRO_EVENT_FIELDS_FRAGMENT = gql`
  fragment DistroEventFields on DistributionEvent {
    id
    state
    name
    state
    distributionSpot {
      name
    }
    plannedStartDateTime
    plannedEndDateTime
    state
  }
`;

export const BOX_FIELDS_FRAGMENT = gql`
  fragment BoxFields on Box {
    labelIdentifier
    state
    size {
      ${SIZE_FIELDS_FRAGMENT}
    }
    numberOfItems
    comment
    product {
      ${PRODUCT_BASIC_FIELDS_FRAGMENT}
    }
    tags {
      ${TAG_FIELDS_FRAGMENT}
    }
    distributionEvent {
      ${DISTRO_EVENT_FIELDS_FRAGMENT}
    }
    location {
      __typename
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
      base {
        locations {
            ${LOCATION_FIELDS_FRAGMENT}
        }
        distributionEventsBeforeReturnedFromDistributionState {
          id
          state
          distributionSpot {
            name
          }
          name
          plannedStartDateTime
          plannedEndDateTime
        }
      }
    }
  }
`;
