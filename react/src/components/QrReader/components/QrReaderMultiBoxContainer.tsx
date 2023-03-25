import { useCallback, useMemo, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxState, ShipmentsQuery, ShipmentState } from "types/generated/graphql";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";

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
  const [multiBoxAction, setMultiBoxAction] = useState<IMultiBoxAction>(
    IMultiBoxAction.assignShipment,
  );

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

  const removeNonInStockBoxesFromScannedBoxes = useCallback(() => {
    apolloClient.cache.updateQuery(
      {
        query: GET_SCANNED_BOXES,
      },
      (data) => ({
        scannedBoxes: data.scannedBoxes.filter((box) => box.state === BoxState.InStock),
      }),
    );
  }, [apolloClient]);

  const onAssignBoxesToShipment = useCallback(() => {}, []);

  // Data preparation
  const shipmentOptions: IDropdownOption[] = useMemo(
    () =>
      shipmentsQueryResult.data?.shipments
        ?.filter((shipment) => shipment.state === ShipmentState.Preparing)
        ?.map((shipment) => ({
          label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
          value: shipment.id,
        })) ?? [],
    [shipmentsQueryResult.data?.shipments],
  );

  const boxesNotInStock = useMemo(
    () => scannedBoxesQueryResult.data.scannedBoxes.filter((box) => box.state !== BoxState.InStock),
    [scannedBoxesQueryResult.data.scannedBoxes],
  );

  if (shipmentsQueryResult.loading) {
    return <QrReaderMultiBoxSkeleton />;
  }

  return (
    <Stack direction="column" spacing={2}>
      {shipmentsQueryResult.error && (
        <AlertWithoutAction alertText="Could not fetch shipments data! Please try reloading the page." />
      )}
      {multiBoxAction === IMultiBoxAction.assignShipment && boxesNotInStock.length > 0 && (
        <AlertWithAction
          alertText="A box must be in the InStock state to be assigned to a shipment."
          actionText="Click here to remove all non InStock Boxes from the list."
          onActionClick={removeNonInStockBoxesFromScannedBoxes}
        />
      )}
      <QrReaderMultiBox
        multiBoxAction={multiBoxAction}
        onChangeMultiBoxAction={setMultiBoxAction}
        shipmentOptions={shipmentOptions}
        scannedBoxesCount={scannedBoxesQueryResult.data?.scannedBoxes.length}
        nonInStockBoxesCount={boxesNotInStock.length}
        onDeleteScannedBoxes={onDeleteScannedBoxes}
        onUndoLastScannedBox={onUndoLastScannedBox}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
      />
    </Stack>
  );
}

export default QrReaderMultiBoxContainer;
