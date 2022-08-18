import { gql, useMutation, useQuery } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  AssignBoxToDistributionEventMutation,
  AssignBoxToDistributionEventMutationVariables,
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
  UpdateNumberOfItemsMutation,
  UpdateNumberOfItemsMutationVariables,
} from "types/generated/graphql";
import AddItemsToBoxOverlay from "./components/AddItemsToBoxOverlay";
import TakeItemsFromBoxOverlay from "./components/TakeItemsFromBoxOverlay";
import BoxDetails from "./components/BoxDetails";
import { ASSIGN_BOX_TO_DISTRIBUTION_MUTATION } from "views/Distributions/queries";

const refetchBoxByLabelIdentifierQueryConfig = (labelIdentifier: string) => ({
  query: BOX_BY_LABEL_IDENTIFIER_QUERY,
  variables: {
    labelIdentifier: labelIdentifier,
  },
});

// TODO: try to use reusable fragments
// which can be reused both for the initial query as well as the mutation
export const BOX_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size {
        id
        label
      }
      items
      product {
        name
        gender
      }
      tags {
        id
        name
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
      place {
        __typename
        id
        name
        base {
          locations {
            id
            name
          }
          distributionEventsBeforeReturnState {
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
  mutation UpdateNumberOfItems(
    $boxLabelIdentifier: String!
    $numberOfItems: Int!
  ) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        items: $numberOfItems
      }
    ) {
      labelIdentifier
    }
  }
`;

export const UPDATE_LOCATION_OF_BOX_MUTATION = gql`
  mutation UpdateLocationOfBox(
    $boxLabelIdentifier: String!
    $newLocationId: Int!
  ) {
    updateBox(
      updateInput: {
        labelIdentifier: $boxLabelIdentifier
        locationId: $newLocationId
      }
    ) {
      labelIdentifier
      size {
        id
        label
      }
      items
      product {
        name
        gender
        id
      }
      tags {
        id
        name
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
      place {
        __typename
        id
        name
        base {
          locations {
            id
            name
          }
          distributionEventsBeforeReturnState {
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

export interface ChangeNumberOfItemsBoxData {
  numberOfItems: number;
}

const BTBox = () => {
  const labelIdentifier = useParams<{ labelIdentifier: string }>()
    .labelIdentifier!;
  const { loading, error, data } = useQuery<
    BoxByLabelIdentifierQuery,
    BoxByLabelIdentifierQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_QUERY, {
    variables: {
      labelIdentifier,
    },
    notifyOnNetworkStatusChange: true
  });

  const [updateNumberOfItemsMutation] = useMutation<
    UpdateNumberOfItemsMutation,
    UpdateNumberOfItemsMutationVariables
  >(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, {
    refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
  });

  const [
    assignBoxToDistributionEventMutation,
    assignBoxToDistributionEventMutationStatus,
  ] = useMutation<
    AssignBoxToDistributionEventMutation,
    AssignBoxToDistributionEventMutationVariables
  >(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION, {
    refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
  });

  const [updateBoxLocation, updateBoxLocationMutationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_LOCATION_OF_BOX_MUTATION, {
    refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
  });

  const {
    isOpen: isPlusOpen,
    onOpen: onPlusOpen,
    onClose: onPlusClose,
  } = useDisclosure();
  const {
    isOpen: isMinusOpen,
    onOpen: onMinusOpen,
    onClose: onMinusClose,
  } = useDisclosure();

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (
    updateBoxLocationMutationStatus.loading ||
    assignBoxToDistributionEventMutationStatus.loading
  ) {
    return <APILoadingIndicator />;
  }
  if (
    error ||
    updateBoxLocationMutationStatus.error ||
    assignBoxToDistributionEventMutationStatus.error
  ) {
    console.error(
      "Error in BoxView Overlay: ",
      error ||
        updateBoxLocationMutationStatus.error ||
        assignBoxToDistributionEventMutationStatus.error
    );
    return <div>Error!</div>;
  }

  const boxData = data?.box;

  const onSubmitTakeItemsFromBox = (
    boxFormValues: ChangeNumberOfItemsBoxData
  ) => {
    if (
      boxFormValues.numberOfItems &&
      boxFormValues.numberOfItems > 0 &&
      boxData?.items
    ) {
      updateNumberOfItemsMutation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          numberOfItems: boxData?.items - boxFormValues?.numberOfItems,
        },
      })
        .then(() => {
          onMinusClose();
        })
        .catch((error) => {
          console.error(
            "Error while trying to change number of items in the Box",
            error
          );
        });
    }
  };

  const onSubmitAddItemstoBox = (boxFormValues: ChangeNumberOfItemsBoxData) => {
    if (
      boxFormValues.numberOfItems &&
      boxFormValues.numberOfItems > 0 &&
      boxData?.items
    ) {
      updateNumberOfItemsMutation({
        variables: {
          boxLabelIdentifier: labelIdentifier,
          numberOfItems: boxData?.items + boxFormValues?.numberOfItems,
        },
      })
        .then(() => {
          onPlusClose();
        })
        .catch((error) => {
          console.error(
            "Error while trying to change number of items in the Box",
            error
          );
        });
    }
  };

  const onMoveBoxToLocationClick = (locationId: string) => {
    updateBoxLocation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newLocationId: parseInt(locationId),
      },
    });
  };

  const onAssignBoxToDistributionEventClick = (distributionEventId: string) => {
    assignBoxToDistributionEventMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        distributionEventId: distributionEventId,
      },
    });
  };

  const onUnassignBoxFromDistributionEventClick = (
    distributionEventId: string
  ) => {};

  return (
    <>
      <BoxDetails
        boxData={boxData}
        onPlusOpen={onPlusOpen}
        onMinusOpen={onMinusOpen}
        onMoveToLocationClick={onMoveBoxToLocationClick}
        onAssignBoxToDistributionEventClick={
          onAssignBoxToDistributionEventClick
        }
        onUnassignBoxFromDistributionEventClick={
          onUnassignBoxFromDistributionEventClick
        }
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
};

export default BTBox;
