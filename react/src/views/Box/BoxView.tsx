import { gql, useMutation, useQuery } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  BoxState,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
  UpdateNumberOfItemsMutation,
  UpdateNumberOfItemsMutationVariables,
  UpdateStateMutationVariables,
  UpdateStateMutation,
} from "types/generated/graphql";
import AddItemsToBoxOverlay from "./components/AddItemsToBoxOverlay";
import TakeItemsFromBoxOverlay from "./components/TakeItemsFromBoxOverlay";
import BoxDetails from "./components/BoxDetails";

export const BOX_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      state
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
      place {
        id
        name
        base {
          locations {
            id
            name
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

export const UPDATE_STATE_IN_BOX_MUTATION = gql`
  mutation UpdateState($boxLabelIdentifier: String!, $newState: BoxState!) {
    updateBox(
      updateInput: { labelIdentifier: $boxLabelIdentifier, state: $newState }
    ) {
      labelIdentifier
    }
  }
`;

export const UPDATE_BOX_MUTATION = gql`
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
      state
      items
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
      }
      place {
        id
        name
        base {
          locations {
            id
            name
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
  });

  const [updateNumberOfItemsMutation] = useMutation<
    UpdateNumberOfItemsMutation,
    UpdateNumberOfItemsMutationVariables
  >(UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION, {
    refetchQueries: [
      {
        query: BOX_BY_LABEL_IDENTIFIER_QUERY,
        variables: {
          labelIdentifier: labelIdentifier,
        },
      },
    ],
  });

  const [updateStateMutation] = useMutation<
    UpdateStateMutation,
    UpdateStateMutationVariables
  >(UPDATE_STATE_IN_BOX_MUTATION, {
    refetchQueries: [
      {
        query: BOX_BY_LABEL_IDENTIFIER_QUERY,
        variables: {
          labelIdentifier: labelIdentifier,
        },
      },
    ],
  });

  const [updateBoxLocation, mutationLocationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_BOX_MUTATION);

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
  if (mutationLocationStatus.loading) {
    return <div>Updating box...</div>;
  }
  if (error || mutationLocationStatus.error) {
    console.error(
      "Error in BoxView Overlay: ",
      error || mutationLocationStatus.error
    );
    return <div>Error!</div>;
  }

  const boxData = mutationLocationStatus.data?.updateBox || data?.box;

  const onScrap = () => {
    updateStateMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newState: BoxState.Scrap,
      },
    });
    console.log("onscrap")
  };

  const onLost = () => {
    updateStateMutation({
      variables: {
        boxLabelIdentifier: labelIdentifier,
        newState: BoxState.Lost,
      },
    });
    console.log("onlost")
  };

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
      (boxData?.items || boxData?.items === 0)
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

  return (
    <>
      <BoxDetails
        boxData={boxData}
        onPlusOpen={onPlusOpen}
        onMinusOpen={onMinusOpen}
        onMoveToLocationClick={onMoveBoxToLocationClick}
        onLost={onLost}
        onScrap={onScrap}
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
