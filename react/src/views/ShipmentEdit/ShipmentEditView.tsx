import ShipmentEdit from "./components/ShipmentEdit";
import { SHIPMENT_BY_ID_QUERY } from "../Shipments/ShipmentView";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  UpdateShipmentMutation,
  UpdateShipmentMutationVariables,
} from "types/generated/graphql";
import { ShipmentUpdateValues } from "./components/ShipmentEdit";
import { useParams } from "react-router-dom";

export const UPDATE_SHIPMENT_MUTATION = gql`
  mutation UpdateShipment($updateInput: ShipmentUpdateInput!) {
    updateShipment(updateInput: $updateInput) {
      id
    }
  }
`;

const ShipmentEditView = () => {
  const id = useParams<{ shipmentId: string }>().shipmentId!;
  const [updateShipment, mutationStatus] = useMutation<
    UpdateShipmentMutation,
    UpdateShipmentMutationVariables
  >(UPDATE_SHIPMENT_MUTATION);

  const onSubmitUpdateShipment = (formValues: ShipmentUpdateValues) => {
    console.log("formValues", formValues);
    const updateInput: UpdateShipmentMutationVariables = {
      updateInput: {
        id: id,
        targetBaseId: parseInt(formValues.targetBaseId),
        preparedBoxLabelIdentifiers: formValues.preparedBoxLabelIdentifiers,
        removedBoxLabelIdentifiers: formValues.removedBoxLabelIdentifiers,
      },
    };
    console.log("updateInput for shipment", updateInput);
    console.log("Mutation status", mutationStatus);
    updateShipment({ variables: updateInput });
  };
  const { loading, error, data } = useQuery<
    ShipmentByIdQuery,
    ShipmentByIdQueryVariables
  >(SHIPMENT_BY_ID_QUERY, {
    variables: {
      id,
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error.message);
    console.log(id);
    return <div>Error!</div>;
  }
  if (mutationStatus.loading) {
    return <div>Creating shipment...</div>;
  }
  if (mutationStatus.error) {
    return <div>Error: {JSON.stringify(mutationStatus.error)}</div>;
  }

  const shipmentData = data?.shipment;

  return (
    <>
      Called: {JSON.stringify(mutationStatus.called)} <br />
      Error: {JSON.stringify(mutationStatus.error)} <br />
      Loading: {JSON.stringify(mutationStatus.loading)} <br />
      Data: {JSON.stringify(mutationStatus.data)} <br />
      {/* Data: {JSON.stringify(mutationStatus.client.)} <br /> */}
      {/* Request Raw: {JSON.stringify(mutationStatus.client.__requestRaw.toString())} <br /> */}
      <ShipmentEdit
        shipmentData={shipmentData}
        onSubmitUpdateShipment={onSubmitUpdateShipment}
      />
    </>
  );
};

export default ShipmentEditView;

//const preparedBoxLabelIdentifiers = ["992283", "596670", "535161"];
