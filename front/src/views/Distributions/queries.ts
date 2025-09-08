import { graphql } from "../../../../graphql/graphql";

export const ALL_PRODUCTS_FOR_PACKING_LIST = graphql(`
  query AllProductsForPackingList($baseId: ID!) {
    base(id: $baseId) {
      products {
        id
        name
        gender
        category {
          id
          name
        }
        sizeRange {
          sizes {
            id
            label
          }
        }
      }
    }
  }
`);

export const DISTRO_SPOTS_FOR_BASE_ID = graphql(`
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
          plannedEndDateTime
        }
      }
    }
  }
`);

export const DISTRIBUTION_EVENTS_FOR_BASE_ID = graphql(`
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
`);

export const ASSIGN_BOX_TO_DISTRIBUTION_MUTATION = graphql(`
  mutation AssignBoxToDistributionEvent($boxLabelIdentifier: ID!, $distributionEventId: ID!) {
    assignBoxToDistributionEvent(
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
`);

export const UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION = graphql(`
  mutation UnassignBoxFromDistributionEvent($boxLabelIdentifier: ID!, $distributionEventId: ID!) {
    unassignBoxFromDistributionEvent(
      boxLabelIdentifier: $boxLabelIdentifier
      distributionEventId: $distributionEventId
    ) {
      id
    }
  }
`);

export const MOVE_ITEMS_TO_DISTRIBUTION_EVENT = graphql(`
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
`);

export const RETURN_TRACKING_GROUP_ID_FOR_DISTRIBUTION_EVENT_QUERY = graphql(`
  query ReturnTrackingGroupIdForDistributionEvent($distributionEventId: ID!) {
    distributionEvent(id: $distributionEventId) {
      distributionEventsTrackingGroup {
        id
      }
    }
  }
`);

export const PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY = graphql(`
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
          ... on UnboxedItemsCollection {
            id
          }
        }
      }
    }
  }
`);

export const CHANGE_DISTRIBUTION_EVENT_STATE_MUTATION = graphql(`
  mutation ChangeDistributionEventState(
    $distributionEventId: ID!
    $newState: DistributionEventState!
  ) {
    changeDistributionEventState(distributionEventId: $distributionEventId, newState: $newState) {
      id
      name
      state
      __typename
    }
  }
`);

export const DISTRIBUTION_EVENTS_TRACKING_GROUP_QUERY = graphql(`
  query DistributionEventsTrackingGroup($trackingGroupId: ID!) {
    distributionEventsTrackingGroup(id: $trackingGroupId) {
      id
      distributionEventsTrackingEntries {
        id
        product {
          id
          name
          gender
          category {
            id
            name
          }
        }
        size {
          id
          label
        }
        numberOfItems
        flowDirection
      }
      distributionEvents {
        id
        state
        name
        # boxes {
        #   labelIdentifier
        #   product {
        #     id
        #     name
        #     category {
        #       name
        #     }
        #   }
        #   size {
        #     id
        #     label
        #   }
        #   numberOfItems
        # }
        # unboxedItemsCollections {
        #   product {
        #     id
        #     name
        #     category {
        #       name
        #     }
        #   }
        #   size {
        #     id
        #     label
        #   }
        #   numberOfItems
        # }
        distributionSpot {
          id
          name
        }
        plannedStartDateTime
        plannedEndDateTime
      }
    }
  }
`);

// export const DISTRIBUTION_EVENTS_IN_RETURN_STATE_FOR_BASE_QUERY = graphql(`
//   query DistributionEventsInReturnStateForBase($baseId: ID!) {
//     base(id: $baseId) {
//       distributionEventsInReturnedFromDistributionState {
//         id
//         name
//         state
//         distributionSpot {
//           id
//           name
//         }
//         plannedStartDateTime
//         plannedEndDateTime
//         boxes {
//           id
//           product {
//             id
//             name
//           }
//           size {
//             id
//             label
//           }
//           numberOfItems
//         }

//         unboxedItemsCollections {
//           id
//           product {
//             id
//             name
//           }
//           size {
//             id
//             label
//           }
//           numberOfItems
//         }
//       }
//     }
//   }
// `;

export const START_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION = graphql(`
  mutation StartDistributionEventsTrackingGroup(
    $distributionEventIds: [ID!]!
    $baseId: ID! # $returnedToLocationId: ID
  ) {
    startDistributionEventsTrackingGroup(
      distributionEventIds: $distributionEventIds
      baseId: $baseId # returnedToLocationId: $returnedToLocationId
    ) {
      id
      distributionEvents {
        id
        distributionSpot {
          id
          name
        }
      }
    }
  }
`);

// export const DISTRIBUTION_EVENTS_SUMMARY_BY_IDS_QUERY = graphql(`
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

// export const MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY = graphql(`
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

export const DISTRIBUTION_EVENT_QUERY = graphql(`
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
`);

export const DATA_FOR_RETURN_TRACKING_OVERVIEW_FOR_BASE_QUERY = graphql(`
  query DataForReturnTrackingOverviewForBase($baseId: ID!) {
    base(id: $baseId) {
      distributionEventsTrackingGroups(states: [InProgress]) {
        id
        state
        createdOn
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
      distributionEvents(states: [ReturnedFromDistribution]) {
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
`);

export const SET_RETURNED_NUMBER_OF_ITEMS_FOR_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION = graphql(
  `
    mutation SetReturnedNumberOfItemsForDistributionEventsTrackingGroup(
      $distributionEventsTrackingGroupId: ID!
      $productId: ID!
      $sizeId: ID!
      $numberOfReturnedItems: Int!
    ) {
      setReturnedNumberOfItemsForDistributionEventsTrackingGroup(
        distributionEventsTrackingGroupId: $distributionEventsTrackingGroupId
        productId: $productId
        sizeId: $sizeId
        numberOfItems: $numberOfReturnedItems
      ) {
        id
      }
    }
  `,
);

export const COMPLETE_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION = graphql(`
  mutation CompleteDistributionEventsTrackingGroup($distributionEventsTrackingGroupId: ID!) {
    completeDistributionEventsTrackingGroup(id: $distributionEventsTrackingGroupId) {
      id
    }
  }
`);
