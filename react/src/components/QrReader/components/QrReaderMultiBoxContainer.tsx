import { useCallback, useMemo, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { BoxState, ShipmentsQuery, ShipmentState } from "types/generated/graphql";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import { IGetScannedBoxesQuery } from "types/graphql-local-only";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";
import { NotInStockAlertText } from "./AlertTexts";

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
  // scannedBoxes actions hook
  const { deleteScannedBoxes, undoLastScannedBox, removeNonInStockBoxesFromScannedBoxes } =
    useScannedBoxesActions();
  // local-only (cache) query for scanned Boxes
  const scannedBoxesQueryResult = useQuery<IGetScannedBoxesQuery>(GET_SCANNED_BOXES);
  // fetch shipments data
  const shipmentsQueryResult = useQuery<ShipmentsQuery>(ALL_SHIPMENTS_QUERY);
  // selected radio button
  const [multiBoxAction, setMultiBoxAction] = useState<IMultiBoxAction>(
    IMultiBoxAction.assignShipment,
  );

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

  const notInStockBoxes = useMemo(
    () =>
      scannedBoxesQueryResult.data?.scannedBoxes.filter((box) => box.state !== BoxState.InStock) ??
      [],
    [scannedBoxesQueryResult.data?.scannedBoxes],
  );

  if (shipmentsQueryResult.loading) {
    return <QrReaderMultiBoxSkeleton />;
  }

  return (
    <Stack direction="column" spacing={2}>
      {shipmentsQueryResult.error && (
        <AlertWithoutAction alertText="Could not fetch shipments data! Please try reloading the page." />
      )}
      {multiBoxAction === IMultiBoxAction.assignShipment && notInStockBoxes.length > 0 && (
        <AlertWithAction
          alertText={<NotInStockAlertText notInStockBoxes={notInStockBoxes} />}
          actionText="Click here to remove all non InStock Boxes from the list."
          onActionClick={removeNonInStockBoxesFromScannedBoxes}
        />
      )}
      <QrReaderMultiBox
        multiBoxAction={multiBoxAction}
        onChangeMultiBoxAction={setMultiBoxAction}
        shipmentOptions={shipmentOptions}
        scannedBoxesCount={scannedBoxesQueryResult.data?.scannedBoxes.length ?? 0}
        notInStockBoxesCount={notInStockBoxes.length}
        onDeleteScannedBoxes={deleteScannedBoxes}
        onUndoLastScannedBox={undoLastScannedBox}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
      />
    </Stack>
  );
}

export default QrReaderMultiBoxContainer;
