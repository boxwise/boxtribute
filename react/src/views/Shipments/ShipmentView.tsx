import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { ShipmentByIdQuery, ShipmentByIdQueryVariables } from "types/generated/graphql";
import ShipmentDetail from "./components/ShipmentDetail";
import ShipmentTable from "./components/ShipmentTable";

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
  const tableData = graphqlToTableTransformer(data);
  

  return <>
  <ShipmentDetail shipmentData={shipmentData} />
  <ShipmentTable tableData={tableData}/>
  </>;
};

export default ShipmentView;
