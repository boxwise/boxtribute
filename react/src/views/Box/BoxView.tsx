import { useEffect } from "react";
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
import {
  BOX_FIELDS_FRAGMENT,
  DISTRO_EVENT_FIELDS_FRAGMENT,
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
  TAG_FIELDS_FRAGMENT,
} from "queries/fragments";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
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
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${BOX_FIELDS_FRAGMENT}
  ${TAG_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      ...BoxFields
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
  ${BOX_FIELDS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  ${TAG_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  mutation UpdateLocationOfBox($boxLabelIdentifier: String!, $newLocationId: Int!) {
    updateBox(updateInput: { labelIdentifier: $boxLabelIdentifier, locationId: $newLocationId }) {
      ...BoxFields
      product {
        ...ProductFields
      }
      tags {
        ...TagFields
      }
      distributionEvent {
        ...DistroEventFields
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
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const labelIdentifier = useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const allBoxData = useQuery<BoxByLabelIdentifierQuery, BoxByLabelIdentifierQueryVariables>(
    BOX_BY_LABEL_IDENTIFIER_QUERY,
    {
      variables: {
        labelIdentifier,
      },
      // notifyOnNetworkStatusChange: true
    },
  );

  const [updateNumberOfItemsMutation, updateNumberOfItemsMutationStatus] = useMutation<
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

  const boxData = allBoxData.data?.box;

  const onStateChange = (newState: BoxState) => {
    updateStateMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newState,
      },
      // refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
    })
      .then((res) => {
        createToast({
          title: `Box ${labelIdentifier}`,
          type: res?.errors ? "error" : "success",
          message: res?.errors
            ? `Error: Could not update the box status to ${newState}`
            : `Successfully updated the box status to ${newState} `,
        });
      })
      .catch(() => {
        triggerError({
          message: `Could not update the box status to ${newState}.`,
        });
      });
  };

  const onSubmitTakeItemsFromBox = (boxFormValues: IChangeNumberOfItemsBoxData) => {
    if (boxFormValues.numberOfItems && boxFormValues.numberOfItems > 0 && boxData?.numberOfItems) {
      if (boxFormValues.numberOfItems > boxData?.numberOfItems) {
        createToast({
          title: `Box ${boxData.labelIdentifier}`,
          type: "error",
          message: `Could not remove more than ${boxData?.numberOfItems} items`,
        });
      } else {
        updateNumberOfItemsMutation({
          variables: {
            boxLabelIdentifier: labelIdentifier,
            numberOfItems: (boxData?.numberOfItems || 0) - (boxFormValues?.numberOfItems || 0),
          },
        })
          .then((res) => {
            createToast({
              title: `Box ${boxData.labelIdentifier}`,
              type: res.errors ? "error" : "success",
              message: res.errors
                ? "Error: Could not remove items from the box"
                : `Successfully removed ${boxFormValues?.numberOfItems} items from box`,
            });
            onMinusClose();
          })
          .catch(() => {
            triggerError({
              message: "Could not remove items from the box.",
            });
          });
      }
    }
  };

  const onSubmitAddItemstoBox = (boxFormValues: IChangeNumberOfItemsBoxData) => {
    if (
      boxFormValues.numberOfItems &&
      boxFormValues.numberOfItems > 0 &&
      (boxData?.numberOfItems || boxData?.numberOfItems === 0)
    ) {
      // The number of items must be less than the maximum MySQL signed integer value
      if ((boxData.numberOfItems || 0) + boxFormValues.numberOfItems > 2147483647) {
        createToast({
          title: `Box ${boxData.labelIdentifier}`,
          type: "error",
          message: "The number should be smaller",
        });
      } else {
        updateNumberOfItemsMutation({
          variables: {
            boxLabelIdentifier: labelIdentifier,
            numberOfItems: (boxData?.numberOfItems || 0) + (boxFormValues?.numberOfItems || 0),
          },
        })
          .then((res) => {
            createToast({
              title: `Box ${boxData.labelIdentifier}`,
              type: res.errors ? "error" : "success",
              message: res.errors
                ? "Error: Could not add items to the box"
                : `Successfully added ${boxFormValues?.numberOfItems} items to box`,
            });
            onPlusClose();
          })
          .catch(() => {
            triggerError({
              message: "Could not add items to the box.",
            });
          });
      }
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
      .then((res) => {
        createToast({
          title: `Box ${labelIdentifier}`,
          type: res.errors ? "error" : "success",
          message: res.errors ? "Error: Box could not be moved!" : "Successfully moved the box",
        });
      })
      .catch(() => {
        triggerError({
          message: "Box could not be moved!",
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

  useEffect(() => {
    if (!allBoxData.loading && boxData === undefined) {
      triggerError({ message: "Could not fetch Box Data!" });
    }
  }, [triggerError, allBoxData.loading, boxData]);

  if (
    allBoxData.loading ||
    updateNumberOfItemsMutationStatus.loading ||
    updateBoxLocationMutationStatus.loading ||
    assignBoxToDistributionEventMutationStatus.loading ||
    unassignBoxFromDistributionEventMutationStatus.loading
  ) {
    return <APILoadingIndicator />;
  }

  // TODO: handle errors not with empty div, but forward or roll data back in the view
  if (
    allBoxData.error ||
    updateNumberOfItemsMutationStatus.error ||
    updateBoxLocationMutationStatus.error ||
    assignBoxToDistributionEventMutationStatus.error ||
    unassignBoxFromDistributionEventMutationStatus.error
  ) {
    return <div />;
  }

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
