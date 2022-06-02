import { gql, useMutation, useQuery } from "@apollo/client";
import { CreateShipmentFormValues } from "./components/CreateShipmentForm";
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
  // const id = useParams<{ id: string }>().id!;
  const [createShipment, mutationStatus] = useMutation<
    CreateShipmentMutation,
    CreateShipmentMutationVariables
  >(CREATE_SHIPMENT_MUTATION);

  const onSubmitCreateShipment = (data: CreateShipmentFormValues) => {
    const creationInput: ShipmentCreationInput = {
      transferAgreementId: parseInt(data.transferAgreementId),
      sourceBaseId: parseInt(data.sourceBaseId),
      targetBaseId: parseInt(data.targetBaseId),
    };
    createShipment({ variables: { creationInput } });
  };
  const id = "4";

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

  const createShipmentViewData = data?.transferAgreement;
  console.log(createShipmentViewData);
  return (
    <div>
      <h1>Create Shipment</h1>
    </div>
  );
};
export default CreateShipmentView;
