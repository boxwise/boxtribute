// import { gql, useMutation, useQuery } from "@apollo/client";
// import { useParams } from "react-router-dom";
// import { ShipmentByIdQuery, ShipmentByIdQueryVariables } from "types/generated/graphql";
import QrScanner from "components/QrScanner";
// import ShipmentEdit from "./components/ShipmentEdit";

// export const SHIPMENT_BY_ID_QUERY = gql`
//   query ShipmentById($id: ID!) {
//     shipment(id: $id) {
//       id
//       state
//       startedOn
//       sourceBase {
//         id
//         name
//       }
//       targetBase {
//         id
//         name
//       }
//     }
//   }
// `;

// // export const UPDATE_SHIPMENT_MUTATION = gql`
// //   mutation UpdateShipment($boxLabelIdentifier: String!, $productId: Int!) {
// //     updateShipment(
// //       updateInput: {
// //         id: $shipmentId,
// //         targetBaseId: $targetBaseId,
// //         preparedBoxLabelIdentifiers: $preparedBoxLabelIdentifiers,
// //         removedBoxLabelIdentifiers: $removedBoxLabelIdentifiers,
// //       }
// //     ) {
// //       labelIdentifier
// //     }
// //   }
// // `;

// export const UPDATE_SHIPMENT_MUTATION = gql`
//   mutation UpdateShipment(
//     $updateInput: ShipmentUpdateInput!
//   ) {
//     updateShipment(updateInput: $updateInput) {
//       id
//     }
//   }
// `;

const ShipmentEditView = () => {
//   const id = useParams<{ shipmentId: string }>().shipmentId!;

//   const [updateShipment, mutationStatus] = useMutation<
//   UpdateShipmentMutation,
//   UpdateShipmentMutationVariables
// >(UPDATE_SHIPMENT_MUTATION);
  

//   const { loading, error, data } = useQuery<
//     ShipmentByIdQuery,
//     ShipmentByIdQueryVariables
//   >(SHIPMENT_BY_ID_QUERY, {
//     variables: {
//       id,
//     },
//   });

//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   if (error) {
//     console.error(error.message);
//     console.log(id);
//     return <div>Error!</div>;
//   }

//   if (data?.shipment == null) {
//     return <div>No data</div>;
//   }

//   const shipmentEditData = data?.shipment;

  return <>
  {/* <ShipmentEdit  />; */}
  <QrScanner /></>

};

export default ShipmentEditView;