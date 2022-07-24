import { gql } from "@apollo/client";

export const DISTRIBUTION_EVENTS_FOR_BASE_ID = gql`
  query DistributionEventsForBase($baseId: ID!) {
    base(id: $baseId) {
      distributionEvents {
        id
        name
        plannedStartDateTime
        plannedEndDateTime
        state
        distributionSpot {
          id
          name
        }
      }
    }
  }
`;

export const MOVE_BOX_TO_DISTRIBUTION_MUTATION = gql`
  mutation MoveBoxToDistributionEvent(
    $boxLabelIdentifier: ID!
    $distributionEventId: ID!
  ) {
    moveBoxToDistributionEvent(
      boxLabelIdentifier: $boxLabelIdentifier
      distributionEventId: $distributionEventId
    ) {
      id
      distributionEvent {
        id
        name
        distributionSpot {
          name
        }
      }
    }
  }
`;

export const MOVE_ITEMS_TO_DISTRIBUTION_EVENT = gql`
  mutation MoveItemsToDistributionEvent(
    $boxLabelIdentifier: ID!
    $distributionEventId: ID!
    $numberOfItems: Int!
  ) {
    moveItemsFromBoxToDistributionEvent(
      boxLabelIdentifier: $boxLabelIdentifier
      distributionEventId: $distributionEventId
      numberOfItems: $numberOfItems
    ) {
      id
      items
      distributionEvent {
        id
        name

        boxes {
          elements {
            product {
              name
            }
          }
        }
        distributionSpot {
          id
          name
        }
      }
    }
  }
`;

export const PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY = gql`
  query PackingListEntriesForDistributionEvent($distributionEventId: ID!) {
    distributionEvent(id: $distributionEventId) {
      id
      packingList {
        entries {
          id
          numberOfItems
          product {
            id
            name
            gender
          }
          size {
            id
            label
          }
        }
      }
    }
  }
`;

export const CHANGE_DISTRIBUTION_EVENT_STATE_MUTATION = gql`
  mutation ChangeDistributionEventState(
    $distributionEventId: ID!
    $newState: DistributionEventState!
  ) {
    changeDistributionEventState(
      distributionEventId: $distributionEventId
      newState: $newState
    ) {
      id
      name
      state
      __typename
    }
  }
`;

export const BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY = gql`
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      product {
        id
        name
      }
      size {
        id
        label
      }
      items
    }
  }
`;

export const DISTRIBUTION_EVENT_QUERY = gql`
  query DistributionEvent($eventId: ID!) {
    distributionEvent(id: $eventId) {
      id
      name
      state
      plannedStartDateTime
      plannedEndDateTime
      distributionSpot {
        id
        name
      }
    }
  }
`;
