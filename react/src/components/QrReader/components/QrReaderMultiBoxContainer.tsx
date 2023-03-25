import { useCallback } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { ShipmentsQuery, ShipmentState } from "types/generated/graphql";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import QrReaderMultiBox from "./QrReaderMultiBox";

export const ASSIGN_BOX_TO_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation AssignBoxToShipment($id: ID!, $labelIdentifiers: [String!]) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: $labelIdentifiers
        removedBoxLabelIdentifiers: []
      }
    ) {
      ...ShipmentFields
    }
  }
`;

function QrReaderMultiBoxContainer() {
  const apolloClient = useApolloClient();
  // local-only (cache) query for scanned Boxes
  const scannedBoxesQueryResult = useQuery(GET_SCANNED_BOXES);
  // fetch shipments data
  const shipmentsQueryResult = useQuery<ShipmentsQuery>(ALL_SHIPMENTS_QUERY);

  const onDeleteScannedBoxes = useCallback(() => {
    apolloClient.writeQuery({
      query: GET_SCANNED_BOXES,
      data: {
        scannedBoxes: [],
      },
    });
  }, [apolloClient]);

  const onUndoLastScannedBox = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data) => ({
        scannedBoxes: data.scannedBoxes.slice(0, -1),
      }),
    );
  }, [apolloClient]);

  const onAssignBoxesToShipment = useCallback(() => {}, []);

  if (shipmentsQueryResult.loading) {
    return <QrReaderMultiBoxSkeleton />;
  }

  // Data preparation
  const shipmentOptions: IDropdownOption[] =
    shipmentsQueryResult.data?.shipments
      ?.filter((shipment) => shipment.state === ShipmentState.Preparing)
      ?.map((shipment) => ({
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        value: shipment.id,
      })) ?? [];

  return (
    <>
      {shipmentsQueryResult.error && (
        <AlertWithoutAction alertText="Could not fetch shipments data! Please try reloading the page." />
      )}
      <QrReaderMultiBox
        shipmentOptions={shipmentOptions}
        scannedBoxesCount={scannedBoxesQueryResult.data?.scannedBoxes.length}
        onDeleteScannedBoxes={onDeleteScannedBoxes}
        onUndoLastScannedBox={onUndoLastScannedBox}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
      />
    </>
  );
}

export default QrReaderMultiBoxContainer;
