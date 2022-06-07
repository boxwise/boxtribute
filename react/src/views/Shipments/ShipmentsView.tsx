import { gql, useQuery } from "@apollo/client";
import { Shipment, ShipmentsQuery, ShipmentsQueryVariables } from "types/generated/graphql";
import ShipmentsTable from "./components/ShipmentsTable";

export const SHIPMENTS_QUERY = gql`
  query shipments {
  shipments {
    id
  	transferAgreement {
      targetOrganisation {
        name
      }
    }
    state
    targetBase {
      name
    }
    details {
      box {
        labelIdentifier
        items 
      }
    }
  }
}
`;

const graphqlToTableTransformer = (
  shipmentsQueryResult: ShipmentsQuery | undefined
) =>
shipmentsQueryResult?.shipments.map((shipment) => ({
    id: shipment.id,
    state: shipment.state,
    targetOrganisation: shipment.transferAgreement?.targetOrganisation?.name,
    targetBase: shipment.targetBase?.name,
    numberOfBoxes: shipment.details?.length,
  })) || [];

const ShipmentsView = () => {

    const { loading, error, data } = useQuery<ShipmentsQuery, ShipmentsQueryVariables>(SHIPMENTS_QUERY);

    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      console.error(error);
      return <div>Error!</div>;
    }
    const tableData = graphqlToTableTransformer(data);

  return <ShipmentsTable tableData={tableData} />;
};

export default ShipmentsView;



