import { gql, useMutation, useQuery } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
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
  const labelIdentifier =
    useParams<{ labelIdentifier: string }>().labelIdentifier!;
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

  const [updateBoxLocation, mutationLocationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_LOCATION_OF_BOX_MUTATION);

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

  const onSubmitTakeItemsFromBox = (
    boxFormValues: ChangeNumberOfItemsBoxData
  ) => {
    console.log("boxLabelIdentifier", labelIdentifier);
    console.log("boxFormValues", boxFormValues);

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
          console.log(
            "Error while trying to change number of items in the Box",
            error
          );
        });
    }
  };

  const onSubmitAddItemstoBox = (
    boxFormValues: ChangeNumberOfItemsBoxData
  ) => {
    console.log("boxLabelIdentifier", labelIdentifier);
    console.log("boxFormValues", boxFormValues);

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
          console.log(
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
