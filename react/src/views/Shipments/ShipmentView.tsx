import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { ShipmentByIdQuery, ShipmentByIdQueryVariables } from "types/generated/graphql";
import ShipmentDetail from "./components/ShipmentDetail";
import ShipmentTable from "./components/ShipmentTable";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useContext } from "react";


export const SHIPMENT_BY_ID_QUERY = gql`
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
      id
      state
      startedOn
      sourceBase {
        id
        name
      }
      targetBase {
        id
        name
      }
      details {
        box {
          labelIdentifier
          items 
          product {
            name
            gender
            sizes 
          }
        }
      }
    }
  }
`;

export const SEND_SHIPMENT_MUTATION = gql`
mutation SendShipment(
  $id: ID!
) {
  sendShipment(id: $id) {
    id
  }
}
`
export const CANCEL_SHIPMENT_MUTATION = gql`
mutation CancelShipment(
  $id: ID!
) {
  cancelShipment(id: $id) {
    id
  }
}
`

const graphqlToTableTransformer = (
  shipmentsQueryResult: ShipmentByIdQuery | undefined
) =>
shipmentsQueryResult?.shipment?.details?.map((detail) => ({
  labelIdentifier: detail.box.labelIdentifier,
  items: detail.box.items,
  name: detail.box.product?.name,
  gender: detail.box.product?.gender,
  sizes: detail.box.product?.sizes
 })) || [];

const ShipmentView = () => {
  const navigate = useNavigate();
  const id = useParams<{ shipmentId: string }>().shipmentId!;
  const baseId = useParams<{ baseId: string }>().baseId!;
  const transferAgreementid = useParams<{ transferAgreementId: string }>().transferAgreementId!;
  
const [sendShipment] = useMutation(
  SEND_SHIPMENT_MUTATION
);

const [cancelShipment] = useMutation(
  CANCEL_SHIPMENT_MUTATION
);

const onSendShipmentClick = () => {
  sendShipment({ variables: { id } });
  navigate(`/bases/${baseId}/transfers/${transferAgreementid}/shipments`)
  console.log(sendShipment);
};

const onCancelShipmentClick = () => {
  cancelShipment({ variables: { id } });
  navigate(`/bases/${baseId}/transfers/${transferAgreementid}/shipments`)
  console.log(cancelShipment);
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

  if (data?.shipment == null) {
    return <div>No data</div>;
  }

  const shipmentData = data.shipment;
  const tableData = graphqlToTableTransformer(data);
  const isIncoming = parseInt(shipmentData.targetBase!.id) === parseInt(baseId);
  

  return <>
  <ShipmentDetail shipmentData={shipmentData} />
  <ShipmentTable tableData={tableData} onSendShipmentClick={onSendShipmentClick} onCancelShipmentClick={onCancelShipmentClick}/>
  </>;
};

export default ShipmentView;
