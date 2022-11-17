import { gql, useMutation, useQuery } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  AssignBoxToDistributionEventMutation,
  AssignBoxToDistributionEventMutationVariables,
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  BoxState,
  UnassignBoxFromDistributionEventMutation,
  UnassignBoxFromDistributionEventMutationVariables,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
  UpdateNumberOfItemsMutation,
  UpdateNumberOfItemsMutationVariables,
  UpdateStateMutationVariables,
  UpdateStateMutation,
} from "types/generated/graphql";
import {
  ASSIGN_BOX_TO_DISTRIBUTION_MUTATION,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import { notificationVar } from "providers/ApolloAuth0Provider";
import AddItemsToBoxOverlay from "./components/AddItemsToBoxOverlay";
import TakeItemsFromBoxOverlay from "./components/TakeItemsFromBoxOverlay";
import BoxDetails from "./components/BoxDetails";

const refetchBoxByLabelIdentifierQueryConfig = (labelIdentifier: string) => ({
  query: BOX_BY_LABEL_IDENTIFIER_QUERY,
  variables: {
    labelIdentifier,
  },
});

// TODO: try to use reusable fragments
// which can be reused both for the initial query as well as the mutation
export const BOX_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      state
      size {
        id
        label
      }
      numberOfItems
      comment
      product {
        name
        gender
      }
      tags {
        id
        name
        color
      }
      distributionEvent {
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
      location {
        __typename
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
  }
`;

export const UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION = gql`
  mutation UpdateNumberOfItems($boxLabelIdentifier: String!, $numberOfItems: Int!) {
    updateBox(
      updateInput: { labelIdentifier: $boxLabelIdentifier, numberOfItems: $numberOfItems }
    ) {
      labelIdentifier
    }
  }
`;

export const UPDATE_STATE_IN_BOX_MUTATION = gql`
  mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
    updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }) {
      labelIdentifier
    }
  }
`;

export const UPDATE_BOX_MUTATION = gql`
  mutation UpdateLocationOfBox($boxLabelIdentifier: String!, $newLocationId: Int!) {
    updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, locationId: $newLocationId }) {
      labelIdentifier
      size {
        id
        label
      }
      state
      numberOfItems
      comment
      product {
        name
        gender
        id
        sizeRange {
          sizes {
            id
            label
          }
        }
      }
      tags {
        id
        name
      }
      tags {
        id
        name
        color
      }
      distributionEvent {
        id
        name
        state
        distributionSpot {
          name
        }
        plannedStartDateTime
        plannedEndDateTime
        state
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
  }
`;

export interface IChangeNumberOfItemsBoxData {
  numberOfItems: number;
}

function BTBox() {
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const { loading, error, data } = useQuery<
    BoxByLabelIdentifierQuery,
    BoxByLabelIdentifierQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_QUERY, {
    variables: {
      labelIdentifier,
    },
    // notifyOnNetworkStatusChange: true
  });

  const [updateNumberOfItemsMutation] = useMutation<
    UpdateNumberOfItemsMutation,
    UpdateNumberOfItemsMutationVariables
  >(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, {
    refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
  });

  const [assignBoxToDistributionEventMutation, assignBoxToDistributionEventMutationStatus] =
    useMutation<
      AssignBoxToDistributionEventMutation,
      AssignBoxToDistributionEventMutationVariables
    >(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION, {
      refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
    });

  const [unassignBoxFromDistributionEventMutation, unassignBoxFromDistributionEventMutationStatus] =
    useMutation<
      UnassignBoxFromDistributionEventMutation,
      UnassignBoxFromDistributionEventMutationVariables
    >(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

  const [updateStateMutation] = useMutation<UpdateStateMutation, UpdateStateMutationVariables>(
    UPDATE_STATE_IN_BOX_MUTATION,
    {
      refetchQueries: [
        {
          query: BOX_BY_LABEL_IDENTIFIER_QUERY,
          variables: {
            labelIdentifier,
          },
        },
      ],
    },
  );

  const [updateBoxLocation, updateBoxLocationMutationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_BOX_MUTATION);

  const { isOpen: isPlusOpen, onOpen: onPlusOpen, onClose: onPlusClose } = useDisclosure();
  const { isOpen: isMinusOpen, onOpen: onMinusOpen, onClose: onMinusClose } = useDisclosure();

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (
    updateBoxLocationMutationStatus.loading ||
    assignBoxToDistributionEventMutationStatus.loading ||
    unassignBoxFromDistributionEventMutationStatus.loading
  ) {
    return <APILoadingIndicator />;
  }
  if (
    error ||
    updateBoxLocationMutationStatus.error ||
    assignBoxToDistributionEventMutationStatus.error ||
    unassignBoxFromDistributionEventMutationStatus.error
  ) {
    notificationVar({
      title: "Error",
      type: "error",
      message: "Could not update the box",
    });
    return <div />;
  }

  const boxData = data?.box;

  const onStateChange = (newState: BoxState) => {
    updateStateMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newState,
      },
      // refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
    })
      .then(() => {
        notificationVar({
          title: `Box ${labelIdentifier}`,
          type: "success",
          message: `Successfully updated the box state to ${newState} `,
        });
      })
      .catch(() => {
        notificationVar({
          title: `Box ${labelIdentifier}`,
          type: "error",
          message: "Error while trying to updat the Box state",
        });
      });
  };

  const onSubmitTakeItemsFromBox = (boxFormValues: IChangeNumberOfItemsBoxData) => {
    if (boxFormValues.numberOfItems && boxFormValues.numberOfItems > 0 && boxData?.numberOfItems) {
      updateNumberOfItemsMutation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          numberOfItems: (boxData?.numberOfItems || 0) - (boxFormValues?.numberOfItems || 0),
        },
      })
        .then(() => {
          notificationVar({
            title: `Box ${boxData.labelIdentifier}`,
            type: "success",
            message: `Successfully take ${boxFormValues?.numberOfItems}x from box`,
          });
          onMinusClose();
        })
        .catch(() => {
          notificationVar({
            title: `Box ${boxData.labelIdentifier}`,
            type: "error",
            message: "Error while trying to change number of items in the Box",
          });
        });
    }
  };

  const onSubmitAddItemstoBox = (boxFormValues: IChangeNumberOfItemsBoxData) => {
    if (
      boxFormValues.numberOfItems &&
      boxFormValues.numberOfItems > 0 &&
      (boxData?.numberOfItems || boxData?.numberOfItems === 0)
    ) {
      updateNumberOfItemsMutation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          numberOfItems: (boxData?.numberOfItems || 0) + (boxFormValues?.numberOfItems || 0),
        },
      })
        .then(() => {
          notificationVar({
            title: `Box ${boxData.labelIdentifier}`,
            type: "success",
            message: `Successfully add ${boxFormValues?.numberOfItems}x to the box`,
          });
          onPlusClose();
        })
        .catch(() => {
          notificationVar({
            title: `Box ${boxData.labelIdentifier}`,
            type: "error",
            message: "Error while trying to change number of items in the Box",
          });
        });
    }
  };

  const onMoveBoxToLocationClick = (locationId: string) => {
    updateBoxLocation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newLocationId: parseInt(locationId, 10),
      },
      refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
    })
      .then(() => {
        notificationVar({
          title: `Box ${labelIdentifier}`,
          type: "success",
          message: "Successfully moved the box",
        });
      })
      .catch(() => {
        notificationVar({
          title: `Box ${labelIdentifier}`,
          type: "error",
          message: "Error while trying to move the Box",
        });
      });
  };

  const onAssignBoxToDistributionEventClick = (distributionEventId: string) => {
    assignBoxToDistributionEventMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        distributionEventId,
      },
      refetchQueries: [
        refetchBoxByLabelIdentifierQueryConfig(labelIdentifier),
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: { distributionEventId },
        },
      ],
    });
  };

  const onUnassignBoxFromDistributionEventClick = (distributionEventId: string) => {
    unassignBoxFromDistributionEventMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        distributionEventId,
      },
      refetchQueries: [
        refetchBoxByLabelIdentifierQueryConfig(labelIdentifier),
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: { distributionEventId },
        },
      ],
    });
  };

  return (
    <>
      <BoxDetails
        boxData={boxData}
        onPlusOpen={onPlusOpen}
        onMinusOpen={onMinusOpen}
        onMoveToLocationClick={onMoveBoxToLocationClick}
        onStateChange={onStateChange}
        onAssignBoxToDistributionEventClick={onAssignBoxToDistributionEventClick}
        onUnassignBoxFromDistributionEventClick={onUnassignBoxFromDistributionEventClick}
      />
      <AddItemsToBoxOverlay
        isOpen={isPlusOpen}
        onClose={onPlusClose}
        onSubmitAddItemstoBox={onSubmitAddItemstoBox}
      />
      <TakeItemsFromBoxOverlay
        isOpen={isMinusOpen}
        onClose={onMinusClose}
        onSubmitTakeItemsFromBox={onSubmitTakeItemsFromBox}
      />
    </>
  );
}

export default BTBox;
