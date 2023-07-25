/* eslint-disable indent */
import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SCANNED_BOXES } from "queries/local-only";
import {
  BoxState,
  ShipmentState,
  MultiBoxActionOptionsForLocationsTagsAndShipmentsQuery,
  TagType,
} from "types/generated/graphql";
import { MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY } from "queries/queries";
import { IDropdownOption } from "components/Form/SelectField";
import { AlertWithAction, AlertWithoutAction } from "components/Alerts";
import { QrReaderMultiBoxSkeleton } from "components/Skeletons";
import { Stack } from "@chakra-ui/react";
import { IBoxBasicFields, IGetScannedBoxesQuery } from "types/graphql-local-only";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { useScannedBoxesActions } from "hooks/useScannedBoxesActions";
import { IMoveBoxesResultKind, useMoveBoxes } from "hooks/useMoveBoxes";
import { IAssignTagsResultKind, useAssignTags } from "hooks/useAssignTags";
import {
  IAssignBoxToShipmentResultKind,
  useAssignBoxesToShipment,
} from "hooks/useAssignBoxesToShipment";
import QrReaderMultiBox, { IMultiBoxAction } from "./QrReaderMultiBox";
import {
  FailedBoxesFromAssignTagsAlert,
  FailedBoxesFromAssingToShipmentAlert,
  FailedBoxesFromMoveBoxesAlert,
  NotInStockAlertText,
} from "./AlertTexts";

interface IQrReaderMultiBoxContainerProps {
  onSuccess: () => void;
}

function QrReaderMultiBoxContainer({ onSuccess }: IQrReaderMultiBoxContainerProps) {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const currentBaseId = globalPreferences.selectedBaseId;
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

  // fetch location and shipments data
  const optionsQueryResult = useQuery<MultiBoxActionOptionsForLocationsTagsAndShipmentsQuery>(
    MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
    {
      variables: { baseId: currentBaseId },
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

  const onMoveBoxes = useCallback(
    async (locationId: string) => {
      const moveBoxesResult = await moveBoxes(
        (scannedBoxesQueryResult.data?.scannedBoxes ?? []).map((box) => box.labelIdentifier),
        parseInt(locationId, 10),
      );
      // remove all moved Boxes from the cache
      if (moveBoxesResult?.movedLabelIdentifiers?.length) {
        removeBoxesFromScannedBoxesByLabelIdentifier(moveBoxesResult.movedLabelIdentifiers);
      }
      // To show in the UI which boxes failed
      setFailedBoxesFromMoveBoxes(moveBoxesResult?.failedLabelIdentifiers ?? []);
      // only if all Boxes were moved
      if (moveBoxesResult.kind === IMoveBoxesResultKind.SUCCESS) {
        onSuccess();
      }
    },
    [
      moveBoxes,
      onSuccess,
      removeBoxesFromScannedBoxesByLabelIdentifier,
      scannedBoxesQueryResult.data?.scannedBoxes,
    ],
  );

  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      const assignTagsResult = await assignTags(
        (scannedBoxesQueryResult.data?.scannedBoxes ?? []).map((box) => box.labelIdentifier),
        tagIds.map((tagId) => parseInt(tagId, 10)),
      );
      // remove all moved Boxes from the cache
      if (assignTagsResult?.successfulLabelIdentifiers?.length) {
        removeBoxesFromScannedBoxesByLabelIdentifier(assignTagsResult.successfulLabelIdentifiers);
      }
      // To show in the UI which boxes failed
      setFailedBoxesFromAssignTags(assignTagsResult?.failedLabelIdentifiers ?? []);
      // only if all Boxes were moved
      if (assignTagsResult.kind === IAssignTagsResultKind.SUCCESS) {
        onSuccess();
      }
    },
    [
      assignTags,
      onSuccess,
      removeBoxesFromScannedBoxesByLabelIdentifier,
      scannedBoxesQueryResult.data?.scannedBoxes,
    ],
  );

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
  // These are all the locations that are retrieved from the query which then filtered out the Scrap and Lost according to the defaultBoxState
  const locationOptions: IDropdownOption[] = useMemo(
    () =>
      optionsQueryResult.data?.base?.locations
        ?.filter(
          (location) =>
            location?.defaultBoxState !== BoxState.Lost &&
            location?.defaultBoxState !== BoxState.Scrap,
        )
        ?.sort((a, b) => Number(a?.seq) - Number(b?.seq))
        ?.map((location) => ({
          label: `${location.name}${
            location.defaultBoxState !== BoxState.InStock
              ? ` - Boxes are ${location.defaultBoxState}`
              : ""
          }`,
          value: location.id,
        })) ?? [],
    [optionsQueryResult.data?.base?.locations],
  );

  const tagOptions: IDropdownOption[] = useMemo(
    () =>
      optionsQueryResult.data?.base?.tags
        ?.filter((tag) => tag?.type === TagType.Box)
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

  const shipmentOptions: IDropdownOption[] = useMemo(
    () =>
      optionsQueryResult.data?.shipments
        ?.filter(
          (shipment) =>
            shipment.state === ShipmentState.Preparing && shipment.sourceBase.id === currentBaseId,
        )
        ?.map((shipment) => ({
          label: `${shipment.targetBase.name} - ${shipment.targetBase.organisation.name}`,
          value: shipment.id,
        })) ?? [],
    [currentBaseId, optionsQueryResult.data?.shipments],
  );

  const notInStockBoxes = useMemo(
    () =>
      scannedBoxesQueryResult.data?.scannedBoxes.filter((box) => box.state !== BoxState.InStock) ??
      [],
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
