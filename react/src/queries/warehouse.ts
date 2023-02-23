import { gql } from "@apollo/client";
import {
  BASE_BASIC_FIELDS_FRAGMENT,
  DISTRO_EVENT_FIELDS_FRAGMENT,
  HISTORY_FIELDS_FRAGMENT,
  TAG_FIELDS_FRAGMENT,
} from "./fragments";

export const PRODUCT_BASIC_FIELDS_FRAGMENT = gql`
  fragment ProductBasicFields on Product {
    id
    name
    gender
  }
`;

export const SIZE_FIELDS_FRAGMENT = gql`
  fragment SizeFields on Size {
    id
    label
  }
`;

export const SIZE_RANGE_FIELDS_FRAGMENT = gql`
  ${SIZE_FIELDS_FRAGMENT}
  fragment SizeRangeFields on SizeRange {
    id
    label
    sizes {
      ...SizeFields
    }
  }
`;

export const PRODUCT_FIELDS_FRAGMENT = gql`
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${SIZE_RANGE_FIELDS_FRAGMENT}
  fragment ProductFields on Product {
    ...ProductBasicFields
    category {
      name
    }
    sizeRange {
      ...SizeRangeFields
    }
  }
`;

export const BOX_BASIC_FIELDS_FRAGMENT = gql`
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${SIZE_FIELDS_FRAGMENT}
  ${TAG_FIELDS_FRAGMENT}
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${HISTORY_FIELDS_FRAGMENT}
  fragment BoxBasicFields on Box {
    labelIdentifier
    state
    product {
      ...ProductBasicFields
    }
    size {
      ...SizeFields
    }
    location {
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
      base {
        ...BaseBasicFields
      }
    }
    numberOfItems
    tags {
      ...TagFields
    }
    comment
    history {
      ...HistoryFields
    }
  }
`;

export const BOX_WITH_SIZE_TAG_PRODUCT_FIELDS_FRAGMENT = gql`
  ${SIZE_FIELDS_FRAGMENT}
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${TAG_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  fragment BoxWithSizeTagProductFields on Box {
    labelIdentifier
    state
    size {
      ...SizeFields
    }
    numberOfItems
    comment
    product {
      ...ProductBasicFields
    }
    tags {
      ...TagFields
    }
    distributionEvent {
      ...DistroEventFields
    }
    location {
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
      base {
        locations {
          id
          name
          ... on ClassicLocation {
            defaultBoxState
          }
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
