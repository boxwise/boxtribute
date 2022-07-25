import { gql, useMutation, useQuery } from "@apollo/client";
import { useDisclosure } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
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
      location {
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
      location {
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

  const [updateNumberOfItemsMutation, mutationStatus] = useMutation<
    UpdateLocationOfBoxMutation,
    UpdateLocationOfBoxMutationVariables
  >(UPDATE_LOCATION_OF_BOX_MUTATION);

  const baseId = useParams<{ baseId: string }>().baseId;
  // const navigate = useNavigate();

  // const [updateContentOfBoxMutation] = useMutation<
  //   UpdateContentOfBoxMutation,
  //   UpdateContentOfBoxMutationVariables
  // >(UPDATE_CONTENT_OF_BOX_MUTATION);

  const onSubmitChangeNumberOfItems = (boxFormValues: ChangeNumberOfItemsBoxData) => {
    console.log("boxLabelIdentifier", labelIdentifier);
    console.log("boxFormValues", boxFormValues);
  }
    
  //   updateContentOfBoxMutation({
  //     variables: {
  //       boxLabelIdentifier: labelIdentifier,
  //       numberOfItems: boxFormValues.numberOfItems,
        
  //     },
  //   })
  //     .then((mutationResult) => {
  //       navigate(
  //         `/bases/${baseId}/boxes/${mutationResult.data?.updateBox?.labelIdentifier}`
  //       );
  //     })
  //     .catch((error) => {
  //       console.log("Error while trying to update Box", error);
  //     });
  // };

  const { isOpen: isPlusOpen, onOpen: onPlusOpen, onClose: onPlusClose } = useDisclosure(); 
  const { isOpen: isMinusOpen, onOpen: onMinusOpen, onClose: onMinusClose } = useDisclosure(); 

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (mutationStatus.loading) {
    return <div>Updating box...</div>;
  }
  if (error || mutationStatus.error) {
    console.error("Error in BoxView: ", error || mutationStatus.error);
    return <div>Error!</div>;
  }

  const boxData = mutationStatus.data?.updateBox || data?.box;

  // const onMoveBoxToLocationClick = (locationId: string) => {
  //   updateBoxLocation({
  //     variables: {
  //       boxLabelIdentifier: labelIdentifier,
  //       newLocationId: parseInt(locationId),
  //     },
  //   });
  // };

  return (
    <>
    <BoxDetails
      boxData={boxData}
      onPlusOpen={onPlusOpen}
      onMinusOpen={onMinusOpen}
      // onMoveToLocationClick={onMoveBoxToLocationClick}
    />
    <AddItemsToBoxOverlay 
      isOpen={isPlusOpen}
      onClose={onPlusClose}

    />
    <TakeItemsFromBoxOverlay
      isOpen={isMinusOpen}
      onClose={onMinusClose}
      onSubmitTakeItemsFromBox={onSubmitChangeNumberOfItems}
    />
    </>
  );
};

export default BTBox;
