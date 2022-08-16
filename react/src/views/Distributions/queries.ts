import { gql } from "@apollo/client";

export const DISTRO_SPOTS_FOR_BASE_ID = gql`
  query DistroSpotsForBaseId($baseId: ID!) {
    base(id: $baseId) {
      distributionSpots {
        id
        name
        latitude
        longitude
        distributionEvents {
          id
          name
          state
          plannedStartDateTime
        }
      }
    }
  }
`;
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
      numberOfItems
      distributionEvent {
        id
        name

        boxes {
          product {
            name
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
      packingListEntries {
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
        matchingPackedItemsCollections {
          __typename
          numberOfItems
          ... on Box {
            labelIdentifier
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
      numberOfItems
    }
  }
`;

// export const DISTRIBUTION_EVENTS_SUMMARY_BY_IDS_QUERY = gql`
//   query DistributionEventsSummaryByIds($distributionEventIds: [ID!]!) {
//     distributionEventsSummary(ids: $distributionEventIds) {
//       distributionEvents {
//         id
//         name
//         plannedStartDateTime
//         plannedEndDateTime
//         state
//         distributionSpot {
//           id
//           name
//         }
//       }
//       totalCount
//     }
//   }
// `;

// export const MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY = gql`
// query MatchingPackedItemsCollectionsForPackingListEntry($packingListEntryId: ID!) {
//   packingListEntry(id: $packingListEntryId) {
//     matchingPackedItemsCollections {
//       __typename
//       numberOfItems
//       ... on Box {
//         labelIdentifier
//       }
//     }
//   }
// }`;

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
