import { gql, useMutation, useQuery } from "@apollo/client";
import { Box, Button, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
  UpdateLocationOfBoxMutation,
  UpdateLocationOfBoxMutationVariables,
} from "types/generated/graphql";
import BoxEdit from "./components/BoxEdit";

export const BOX_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size
      items
      product {
        name
        gender
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

// export const UPDATE_LOCATION_OF_BOX_MUTATION = gql`
//   mutation UpdateLocationOfBox(
//     $boxLabelIdentifier: String!
//     $newLocationId: Int!
//   ) {
//     updateBox(
//       updateInput: {
//         labelIdentifier: $boxLabelIdentifier
//         locationId: $newLocationId
//       }
//     ) {
//       labelIdentifier
//       size
//       items
//       product {
//         name
//         gender
//       }
//       location {
//         id
//         name
//         base {
//           locations {
//             id
//             name
//           }
//         }
//       }
//     }
//   }
// `;

const BoxEditView = () => {
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

  // const [updateBoxLocation, mutationStatus] = useMutation<
  //   UpdateLocationOfBoxMutation,
  //   UpdateLocationOfBoxMutationVariables
  // >(UPDATE_LOCATION_OF_BOX_MUTATION);

  if (loading) {
    return <div>Loading...</div>;
  }
  // if (mutationStatus.loading) {
  //   return <div>Updating box...</div>;
  // }
  // if (error || mutationStatus.error) {
  //   console.error(error || mutationStatus.error);
  //   return <div>Error!</div>;
  // }

  // const boxData = mutationStatus.data?.updateBox || data?.box;
  const boxData = data?.box;

  return <BoxEdit boxData={boxData} />;
  return <>JO</>
};

export default BoxEditView;
