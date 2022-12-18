import { gql } from "@apollo/client";

export const PRODUCT_BASIC_FIELDS_FRAGMENT = gql`
  fragment ProductBasicFields on Product {
    id
    name
    gender
  }
`;

export const USER_BASIC_FIELDS_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    name
    organisation {
      name
    }
  }
`;

export const HISTORY_FIELDS_FRAGMENT = gql`
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment HistoryFields on HistoryEntry {
    id
    changes
    changeDate
    user {
      ...UserBasicFields
    }
  }
`;

export const BOX_FIELDS_FRAGMENT = gql`
  ${HISTORY_FIELDS_FRAGMENT}
  fragment BoxFields on Box {
    labelIdentifier
    state
    size {
      id
      label
    }
    numberOfItems
    comment
    history {
      ...HistoryFields
    }
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

export const DISTRO_EVENT_FIELDS_FRAGMENT = gql`
  fragment DistroEventFields on DistributionEvent {
    id
    state
    name
    distributionSpot {
      name
    }
    plannedStartDateTime
    plannedEndDateTime
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
