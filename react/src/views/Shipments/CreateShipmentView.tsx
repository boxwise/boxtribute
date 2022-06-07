import { gql, useMutation, useQuery } from "@apollo/client";
import CreateShipmentForm, { CreateShipmentFormValues } from "./components/CreateShipmentForm";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  TransferAgreementForShipmentsByIdQuery,
  TransferAgreementForShipmentsByIdQueryVariables,
  ShipmentCreationInput,
} from "types/generated/graphql";
import { useEffect } from "react";

export const TRANSFER_AGREEMENT_FOR_SHIPMENTS_BY_ID_QUERY = gql`
  query TransferAgreementForShipmentsById($id: ID!) {
    transferAgreement(id: $id) {
      sourceBases {
        id
        name
      }
      targetBases {
        id
        name
      }
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = gql`
  mutation createShipment($creationInput: ShipmentCreationInput!) {
    createShipment(creationInput: $creationInput) {
      id
    }
  }
`;

const CreateShipmentView = () => {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;
  const id = useParams<{ transferAgreementId: string }>().transferAgreementId!;
  const [createShipment, mutationStatus] = useMutation<
    CreateShipmentMutation,
    CreateShipmentMutationVariables
  >(CREATE_SHIPMENT_MUTATION);

  const onSubmitCreateShipment = (formValues: CreateShipmentFormValues) => {
    console.log("formValues for shipment", formValues);
    const creationInput: ShipmentCreationInput = {
      transferAgreementId: parseInt(id),
      sourceBaseId: parseInt(formValues.sourceBaseId),
      targetBaseId: parseInt(formValues.targetBaseId),
    };
    console.log("creationInput for shipment", creationInput);

    createShipment({ variables: { creationInput } });
  };
 

  const { loading, error, data } = useQuery<
    TransferAgreementForShipmentsByIdQuery,
    TransferAgreementForShipmentsByIdQueryVariables
  >(TRANSFER_AGREEMENT_FOR_SHIPMENTS_BY_ID_QUERY, {
    variables: {
      id,
    },
  });
  useEffect(() => {
    mutationStatus?.data?.createShipment?.id
    &&
      navigate(
        `/bases/${baseId}/transfers/${id}/shipments/${mutationStatus.data.createShipment.id}`
      );
  }, [mutationStatus, navigate, baseId, id]);


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


  const createShipmentViewData = data?.transferAgreement;
  console.log(createShipmentViewData);
  
  return (
    <CreateShipmentForm
    createShipmentViewData={createShipmentViewData}
    onSubmitCreateShipment={onSubmitCreateShipment}
    />
  );
};
export default CreateShipmentView;
