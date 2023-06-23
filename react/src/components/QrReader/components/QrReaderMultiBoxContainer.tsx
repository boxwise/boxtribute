/* eslint-disable indent */
import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import { BoxState, ShipmentsQuery, ShipmentState } from "types/generated/graphql";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import { IBoxBasicFields, IGetScannedBoxesQuery } from "types/graphql-local-only";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import {
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";
import { FailedBoxesFromAssingToShipmentAlert, NotInStockAlertText } from "./AlertTexts";

interface IQrReaderMultiBoxContainerProps {
  onSuccess: () => void;
}

function QrReaderMultiBoxContainer({ onSuccess }: IQrReaderMultiBoxContainerProps) {
  const navigate = useNavigate();
  // scannedBoxes actions hook
  const {
    flushAllBoxes: deleteScannedBoxes,
    undoLastBox: undoLastScannedBox,
    removeNotInStockBoxes: removeNonInStockBoxesFromScannedBoxes,
    removeBoxesByLabelIdentifier: removeBoxesFromScannedBoxesByLabelIdentifier,
  } = useScannedBoxesActions();
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

  // state to save boxes that failed to assign to a shipment
  const [failedBoxesFromAssignToShipment, setFailedBoxesFromAssignToShipment] = useState<
    IBoxBasicFields[]
  >([]);

  const onAssignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const assignBoxesToShipmentResult = await assignBoxesToShipment(
        shipmentId,
        scannedBoxesQueryResult.data?.scannedBoxes ?? [],
      );
      // remove all assigned Boxes from the cache
      if (assignBoxesToShipmentResult?.assignedBoxes?.length) {
        removeBoxesFromScannedBoxesByLabelIdentifier(
          assignBoxesToShipmentResult.assignedBoxes.map((box) => box.labelIdentifier),
        );
      }
      // To show in the UI which boxes failed
      setFailedBoxesFromAssignToShipment(assignBoxesToShipmentResult?.failedBoxes ?? []);
      // only if all Boxes were assigned
      if (assignBoxesToShipmentResult.kind === IAssignBoxToShipmentResultKind.SUCCESS) {
        onSuccess();
        navigate(`/bases/${currentBaseId}/transfers/shipments/${shipmentId}`);
      }
    },
    [
      assignBoxesToShipment,
      currentBaseId,
      navigate,
      onSuccess,
      removeBoxesFromScannedBoxesByLabelIdentifier,
      scannedBoxesQueryResult.data?.scannedBoxes,
    ],
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
        <AlertWithoutAction alertText="Could not fetch shipments data! Please reload the page." />
      )}
      {multiBoxAction === IMultiBoxAction.assignShipment &&
        notInStockBoxes.length > 0 &&
        failedBoxesFromAssignToShipment.length === 0 && (
          <AlertWithAction
            alertText={<NotInStockAlertText notInStockBoxes={notInStockBoxes} />}
            actionText="Click here to remove all non InStock boxes from the list."
            onActionClick={removeNonInStockBoxesFromScannedBoxes}
          />
        )}
      {failedBoxesFromAssignToShipment.length > 0 && (
        <AlertWithAction
          alertText={
            <FailedBoxesFromAssingToShipmentAlert failedBoxes={failedBoxesFromAssignToShipment} />
          }
          actionText="Click here to remove all failed boxes from the list."
          onActionClick={() => {
            removeBoxesFromScannedBoxesByLabelIdentifier(
              failedBoxesFromAssignToShipment.map((box) => box.labelIdentifier),
            );
            setFailedBoxesFromAssignToShipment([]);
          }}
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
