import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { ShipmentByIdQuery, ShipmentByIdQueryVariables } from "types/generated/graphql";
import ShipmentDetail from "./components/ShipmentDetail";

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
    }
  }
`;

const ShipmentView = () => {
  const id = useParams<{ shipmentId: string }>().shipmentId!;

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

  const shipmentData = data?.shipment;

  return <ShipmentDetail shipmentData={shipmentData} />;
};

export default ShipmentView;
