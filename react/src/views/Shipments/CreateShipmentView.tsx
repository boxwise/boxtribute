import { gql, useMutation, useQuery } from "@apollo/client";
import CreateShipmentForm, { CreateShipmentFormValues } from "./components/CreateShipmentForm";
import { useParams } from "react-router-dom";
import {
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  TransferAgreementByIdQuery,
  TransferAgreementForShipmentsByIdQuery,
  TransferAgreementForShipmentsByIdQueryVariables,
  ShipmentCreationInput,
} from "types/generated/graphql";

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


// const onSubmit = (data: TransferAgreementFormValues) => {
//   // setSubmittedVal(data);
//   const creationInput: TransferAgreementCreationInput = {
//     targetOrganisationId: parseInt(data.targetOrganisationId),
//     type: TransferAgreementType[data.transferType],
//   };
//   createTransferAgreement({ variables: { creationInput } });
//   console.log(data);
// };

export const CREATE_SHIPMENT_MUTATION = gql`
  mutation createShipment($creationInput: ShipmentCreationInput!) {
    createShipment(creationInput: $creationInput) {
      id
    }
  }
`;

const CreateShipmentView = () => {
  ////////////////////////////////////////////////
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
    
    // console.log("create shimpent", createShipmentViewData)
  };
 

  const { loading, error, data } = useQuery<
    TransferAgreementForShipmentsByIdQuery,
    TransferAgreementForShipmentsByIdQueryVariables
  >(TRANSFER_AGREEMENT_FOR_SHIPMENTS_BY_ID_QUERY, {
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
