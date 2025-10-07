import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { useAtomValue } from "jotai";
import { GET_SCANNED_BOXES } from "queries/local-only";
import {
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_AND_TAGS_QUERY,
} from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import { IBoxBasicFields, IGetScannedBoxesQuery } from "types/graphql-local-only";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import { IMoveBoxesResultKind, useMoveBoxes } from "hooks/useMoveBoxes";
import { useAssignTags } from "hooks/useAssignTags";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { useNotification } from "hooks/useNotification";
import { useHasPermission } from "hooks/hooks";
import { locationToDropdownOptionTransformer } from "utils/transformers";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";
import {
  FailedBoxesFromAssignTagsAlert,
  FailedBoxesFromAssingToShipmentAlert,
  FailedBoxesFromMoveBoxesAlert,
  NotInStockAlertText,
} from "./AlertTexts";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

function QrReaderMultiBoxContainer() {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const hasShipmentPermission = useHasPermission("view_shipments");

  // selected radio button
  const [multiBoxAction, setMultiBoxAction] = useState<IMultiBoxAction>(IMultiBoxAction.moveBox);

  // state to save boxes that failed from moveBoxes
  const [failedBoxesFromMoveBoxes, setFailedBoxesFromMoveBoxes] = useState<string[]>([]);
  // state to save boxes that failed from assignTags
  const [failedBoxesFromAssignTags, setFailedBoxesFromAssignTags] = useState<string[]>([]);
  // state to save boxes that failed to assign to a shipment
  const [failedBoxesFromAssignToShipment, setFailedBoxesFromAssignToShipment] = useState<
    IBoxBasicFields[]
  >([]);

  // local-only (cache) query for scanned Boxes
  const scannedBoxesQueryResult = useQuery<IGetScannedBoxesQuery>(GET_SCANNED_BOXES);

  // fetch location and optionally shipments data based on user permissions
  const optionsQueryResult = useQuery(
    hasShipmentPermission
      ? MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY
      : MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_AND_TAGS_QUERY,
    {
      variables: { baseId },
    },
  );

  // scannedBoxes actions hook
  const {
    flushAllBoxes: deleteScannedBoxes,
    undoLastBox: undoLastScannedBox,
    removeNotInStockBoxes: removeNonInStockBoxesFromScannedBoxes,
    removeBoxesByLabelIdentifier: removeBoxesFromScannedBoxesByLabelIdentifier,
  } = useScannedBoxesActions();

  // box actions hooks
  const { moveBoxes, isLoading: isMoveBoxesLoading } = useMoveBoxes();
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();

  const { createToast } = useNotification();
  const onMoveBoxes = useCallback(
    async (locationId: string) => {
      const moveBoxesResult = await moveBoxes(
        (scannedBoxesQueryResult.data?.scannedBoxes ?? []).map((box) => box.labelIdentifier),
        parseInt(locationId, 10),
      );
      // To show in the UI which boxes failed (don't show alert for boxes that already are in the
      // target location)
      if (moveBoxesResult.kind === IMoveBoxesResultKind.SUCCESS_WITH_BOXES_ALREADY_AT_TARGET) {
        const nrOfNonMovedBoxes = moveBoxesResult?.failedLabelIdentifiers?.length ?? 0;
        createToast({
          message: `${
            nrOfNonMovedBoxes === 1 ? "One box is" : `${nrOfNonMovedBoxes} boxes are`
          } already in the selected location.`,
          type: "warning",
        });
      } else {
        setFailedBoxesFromMoveBoxes(moveBoxesResult?.failedLabelIdentifiers ?? []);
      }
    },
    [moveBoxes, createToast, scannedBoxesQueryResult.data?.scannedBoxes],
  );

  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      const assignTagsResult = await assignTags(
        (scannedBoxesQueryResult.data?.scannedBoxes ?? []).map((box) => box.labelIdentifier),
        tagIds.map((tagId) => parseInt(tagId, 10)),
      );
      // To show in the UI which boxes failed
      setFailedBoxesFromAssignTags(assignTagsResult?.failedLabelIdentifiers ?? []);
    },
    [assignTags, scannedBoxesQueryResult.data?.scannedBoxes],
  );

  const onAssignBoxesToShipment = useCallback(
    async (shipmentId: string) => {
      const assignBoxesToShipmentResult = await assignBoxesToShipment(
        shipmentId,
        scannedBoxesQueryResult.data?.scannedBoxes ?? [],
      );
      // To show in the UI which boxes failed
      setFailedBoxesFromAssignToShipment(assignBoxesToShipmentResult?.failedBoxes ?? []);
      removeBoxesFromScannedBoxesByLabelIdentifier(
        assignBoxesToShipmentResult.assignedBoxes?.map((box) => box.labelIdentifier) ?? [],
      );
    },
    [
      assignBoxesToShipment,
      removeBoxesFromScannedBoxesByLabelIdentifier,
      scannedBoxesQueryResult.data?.scannedBoxes,
    ],
  );

  // Data preparation
  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const locationOptions: IDropdownOption[] = useMemo(
    () => locationToDropdownOptionTransformer(optionsQueryResult.data?.base?.locations ?? []),
    [optionsQueryResult.data?.base?.locations],
  );

  const tagOptions: IDropdownOption[] = useMemo(
    () =>
      optionsQueryResult.data?.base?.tags
        ?.filter((tag) => tag?.type === "All" || tag?.type === "Box")
        ?.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        })
        ?.map((tag) => ({
          label: tag.name,
          value: tag.id,
          color: tag.color,
        })) ?? [],
    [optionsQueryResult.data?.base?.tags],
  );

  const shipmentOptions: IDropdownOption[] = useMemo(() => {
    if (!hasShipmentPermission) return [];

    const queryData = optionsQueryResult.data as any; // Type assertion for union handling
    return (queryData?.shipments || [])
      .filter(
        (shipment: any) => shipment.state === "Preparing" && shipment.sourceBase.id === baseId,
      )
      .map((shipment: any) => ({
        label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
        value: shipment.id,
        subTitle: shipment?.labelIdentifier,
      }));
  }, [baseId, hasShipmentPermission, optionsQueryResult.data]);

  // Assign To Shipment is default MultiBoxAction if there are shipments
  useEffect(() => {
    if (shipmentOptions.length > 0) {
      setMultiBoxAction(IMultiBoxAction.assignShipment);
    }
  }, [shipmentOptions]);

  const notInStockBoxes = useMemo(
    () => scannedBoxesQueryResult.data?.scannedBoxes.filter((box) => box.state !== "InStock") ?? [],
    [scannedBoxesQueryResult.data?.scannedBoxes],
  );

  if (optionsQueryResult.loading) {
    return <QrReaderMultiBoxSkeleton />;
  }

  return (
    <Stack direction="column" spacing={2}>
      {optionsQueryResult.error && (
        <AlertWithoutAction alertText="Could not fetch data for options! Please reload the page." />
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
      {failedBoxesFromMoveBoxes.length > 0 && (
        <AlertWithAction
          alertText={<FailedBoxesFromMoveBoxesAlert failedBoxes={failedBoxesFromMoveBoxes} />}
          actionText="Click here to remove all failed boxes from the list."
          onActionClick={() => {
            removeBoxesFromScannedBoxesByLabelIdentifier(failedBoxesFromMoveBoxes);
            setFailedBoxesFromMoveBoxes([]);
          }}
        />
      )}
      {failedBoxesFromAssignTags.length > 0 && (
        <AlertWithAction
          alertText={<FailedBoxesFromAssignTagsAlert failedBoxes={failedBoxesFromAssignTags} />}
          actionText="Click here to remove all failed boxes from the list."
          onActionClick={() => {
            removeBoxesFromScannedBoxesByLabelIdentifier(failedBoxesFromAssignTags);
            setFailedBoxesFromAssignTags([]);
          }}
        />
      )}
      {failedBoxesFromAssignToShipment.length > 0 && (
        <AlertWithAction
          type="warning"
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
        isSubmitButtonLoading={
          isAssignBoxesToShipmentLoading || isMoveBoxesLoading || isAssignTagsLoading
        }
        multiBoxAction={multiBoxAction}
        onChangeMultiBoxAction={setMultiBoxAction}
        locationOptions={locationOptions}
        tagOptions={tagOptions}
        shipmentOptions={shipmentOptions}
        scannedBoxesCount={scannedBoxesQueryResult.data?.scannedBoxes.length ?? 0}
        notInStockBoxesCount={notInStockBoxes.length}
        onDeleteScannedBoxes={deleteScannedBoxes}
        onUndoLastScannedBox={undoLastScannedBox}
        onMoveBoxes={onMoveBoxes}
        onAssignTags={onAssignTags}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
      />
    </Stack>
  );
}

export default QrReaderMultiBoxContainer;
