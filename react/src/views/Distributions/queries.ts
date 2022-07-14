import { gql } from "@apollo/client";

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
      distributionSpot {
        id
        name
      }
    }
  }
`;
