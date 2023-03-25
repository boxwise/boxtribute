import { useCallback, useContext, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { BoxState, ShipmentsQuery, ShipmentState } from "types/generated/graphql";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import { IGetScannedBoxesQuery } from "types/graphql-local-only";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";
import { NotInStockAlertText } from "./AlertTexts";

function QrReaderMultiBoxContainer() {
  // scannedBoxes actions hook
  const { deleteScannedBoxes, undoLastScannedBox, removeNonInStockBoxesFromScannedBoxes } =
    useScannedBoxesActions();
  // box actions hook
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const currentBaseId = globalPreferences.selectedBaseId;

  // local-only (cache) query for scanned Boxes
  const scannedBoxesQueryResult = useQuery<IGetScannedBoxesQuery>(GET_SCANNED_BOXES);
  // fetch shipments data
  const shipmentsQueryResult = useQuery<ShipmentsQuery>(ALL_SHIPMENTS_QUERY);
  // selected radio button
  const [multiBoxAction, setMultiBoxAction] = useState<IMultiBoxAction>(
    IMultiBoxAction.assignShipment,
  );

  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) => {
      assignBoxesToShipment(shipmentId, scannedBoxesQueryResult.data?.scannedBoxes ?? []);
    },
    [assignBoxesToShipment, scannedBoxesQueryResult?.data?.scannedBoxes],
  );

  // Data preparation
  const shipmentOptions: IDropdownOption[] = useMemo(
    () =>
      shipmentsQueryResult.data?.shipments
        ?.filter(
          (shipment) =>
            shipment.state === ShipmentState.Preparing && shipment.sourceBase.id === currentBaseId,
        )
        ?.map((shipment) => ({
          label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
          value: shipment.id,
        })) ?? [],
    [currentBaseId, shipmentsQueryResult.data?.shipments],
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
        isSubmitButtonLoading={isAssignBoxesToShipmentLoading}
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
