import { Column, Row } from "react-table";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { useNavigate } from "react-router-dom";

import { FaDollyFlatbed } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { useNotification } from "hooks/useNotification";
import { QueryRef } from "@apollo/client";
import { IUseTableConfigReturnType } from "hooks/hooks";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import RemoveBoxesButton from "./RemoveBoxesButton";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";
import ExportToCsvButton from "./ExportToCsvButton";
import { FaTruckArrowRight } from "react-icons/fa6";
import { BsBox2HeartFill } from "react-icons/bs";
import MakeLabelsButton from "./MakeLabelsButton";
import AssignTagsButton from "./AssignTagsButton";
import { IDropdownOption } from "components/Form/SelectField";
import { useAssignTags } from "hooks/useAssignTags";
// import RemoveTagsButton from "./RemoveTagsButton";
import { useUnassignTags } from "hooks/useUnassignTags";

export interface IBoxesActionsAndTableProps {
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  tagOptions: IDropdownOption[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  tableConfig,
  onRefetch,
  boxesQueryRef,
  locationOptions,
  shipmentOptions,
  tagOptions,
  availableColumns,
}: IBoxesActionsAndTableProps) {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);

  const { createToast } = useNotification();

  // Action when clicking on a row
  const onBoxRowClick = (labelIdentifier: string) =>
    navigate(`/bases/${baseId}/boxes/${labelIdentifier}`);

  // --- Actions on selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<BoxRow>[]>([]);
  const thereIsABoxMarkedForShipmentSelected = useMemo(
    () =>
      selectedBoxes.some(
        (box) => box.values.shipment !== null && box.values.state === "MarkedForShipment",
      ),
    [selectedBoxes],
  );

  // Used for remove tags
  const getSelectedBoxTags = useMemo(() => {
    const selectedBoxTags = selectedBoxes.map((box) => box.values.tags);
    const tagsToFilter = new Set(selectedBoxTags.flat().map((tag) => tag.id));
    const commonTags = tagOptions.filter((tag) => tagsToFilter.has(tag.value));
    return commonTags;
  }, [selectedBoxes, tagOptions]);

  // Move Boxes
  const moveBoxesAction = useMoveBoxes();

  const onMoveBoxes = useCallback(
    (locationId: string) => {
      if (selectedBoxes.length === 0) {
        createToast({
          type: "warning",
          message: `Please select a box to move`,
        });
      }
      const movableLabelIdentifiers = selectedBoxes
        .filter(
          (box) => !["Receiving", "MarkedForShipment", "InTransit"].includes(box.values.state),
        )
        .map((box) => box.values.labelIdentifier);

      const boxCountInShipmentStates = selectedBoxes.length - movableLabelIdentifiers.length;
      if (boxCountInShipmentStates > 0) {
        createToast({
          type: "info",
          message: `Cannot move ${
            boxCountInShipmentStates === 1 ? "a box" : `${boxCountInShipmentStates} boxes`
          } in shipment states.`,
        });
      }
      moveBoxesAction
        .moveBoxes(movableLabelIdentifiers, parseInt(locationId, 10), true, false)
        .then((moveBoxesResult) => {
          if (
            moveBoxesResult.failedLabelIdentifiers &&
            moveBoxesResult.failedLabelIdentifiers.length > 0
          ) {
            createToast({
              type: "error",
              message: `Could not move ${
                moveBoxesResult.failedLabelIdentifiers.length === 1
                  ? "a box"
                  : `${moveBoxesResult.failedLabelIdentifiers.length} boxes`
              }. Try again?`,
            });
          }
        });
    },
    [createToast, moveBoxesAction, selectedBoxes],
  );

  // Assign to Shipment
  const { assignBoxesToShipment, isLoading: isAssignBoxesToShipmentLoading } =
    useAssignBoxesToShipment();

  const onAssignBoxesToShipment = useCallback(
    (shipmentId: string) => {
      if (selectedBoxes.length === 0) {
        createToast({
          type: "warning",
          message: `Please select a box to assign to shipment`,
        });
      }
      assignBoxesToShipment(
        shipmentId,
        selectedBoxes.map((box) => box.values as IBoxBasicFields),
        true,
        false,
      ).then((assignBoxesToShipmentResult) => {
        if (
          assignBoxesToShipmentResult.notInStockBoxes &&
          assignBoxesToShipmentResult.notInStockBoxes.length > 0
        ) {
          createToast({
            type: "info",
            message: `Cannot assign ${
              assignBoxesToShipmentResult.notInStockBoxes.length === 1
                ? "a box"
                : `${assignBoxesToShipmentResult.notInStockBoxes.length} boxes`
            } to shipment that ${
              assignBoxesToShipmentResult.notInStockBoxes.length === 1 ? "is" : "are"
            } not InStock.`,
          });
        }
        if (
          assignBoxesToShipmentResult.failedBoxes &&
          assignBoxesToShipmentResult.failedBoxes.length > 0
        ) {
          createToast({
            type: "error",
            message: `Could not assign ${
              assignBoxesToShipmentResult.failedBoxes.length === 1
                ? "a box"
                : `${assignBoxesToShipmentResult.failedBoxes.length} boxes`
            } to shipment. Try again?`,
          });
        }
      });
    },
    [createToast, assignBoxesToShipment, selectedBoxes],
  );

  // Unassign to Shipment
  const {
    unassignBoxesFromShipments,
    unassignBoxesFromShipmentsResult,
    flushResult,
    isLoading: isUnassignBoxesFromShipmentsLoading,
  } = useUnassignBoxesFromShipments();

  const onUnassignBoxesToShipment = useCallback(() => {
    if (selectedBoxes.length === 0) {
      createToast({
        type: "warning",
        message: `Please select a box to unassign from`,
      });
    }
    unassignBoxesFromShipments(
      selectedBoxes.map((box) => {
        const { labelIdentifier, state, shipment } = box.original;
        return {
          labelIdentifier,
          state,
          shipmentDetail: shipment
            ? {
                shipment,
              }
            : null,
        } as IBoxBasicFields;
      }),
    );
  }, [unassignBoxesFromShipments, selectedBoxes, createToast]);

  useEffect(() => {
    if (unassignBoxesFromShipmentsResult) {
      const { notMarkedForShipmentBoxes, failedBoxes } = unassignBoxesFromShipmentsResult;

      if (notMarkedForShipmentBoxes.length > 0) {
        createToast({
          type: "info",
          message: `Cannot remove ${
            notMarkedForShipmentBoxes.length === 1
              ? "a box"
              : `${notMarkedForShipmentBoxes.length} boxes`
          } that ${
            notMarkedForShipmentBoxes.length === 1 ? "is" : "are"
          } not assigned to any shipment.`,
        });
      }
      if (failedBoxes && failedBoxes.length > 0) {
        createToast({
          type: "error",
          message: `Could not remove ${
            failedBoxes.length === 1 ? "a box" : `${failedBoxes.length} boxes`
          } from shipment. Try again?`,
        });
      }
      flushResult();
    }
  }, [createToast, flushResult, unassignBoxesFromShipmentsResult]);

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(() => {
    deleteBoxes(selectedBoxes.map((box) => box.values as IBoxBasicFields));
  }, [deleteBoxes, selectedBoxes]);

  // Assign Tags to Boxes
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const onAssignTags = useCallback(
    async (tagIds: string[]) => {
      await assignTags(
        selectedBoxes.map((box) => box.values.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
      );
    },
    [assignTags, selectedBoxes],
  );

  // Unassign tags from boxes
  const { unassignTags, isLoading: isUnassignTagsLoading } = useUnassignTags();
  const onUnassignTags = useCallback(
    async (tagIds: string[]) => {
      await unassignTags(
        selectedBoxes.map((box) => box.values.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
      );
    },
    [unassignTags, selectedBoxes],
  );

  const actionsAreLoading =
    moveBoxesAction.isLoading ||
    isAssignBoxesToShipmentLoading ||
    isUnassignBoxesFromShipmentsLoading ||
    isDeleteBoxesLoading ||
    isAssignTagsLoading ||
    isUnassignTagsLoading;

  const actionButtons = useMemo(
    () => [
      <SelectButton
        label="Move to ..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaDollyFlatbed />}
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />,
      <SelectButton
        label="Assign to Shipment"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<FaTruckArrowRight />}
        isDisabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />,
      <Menu key="box-actions" closeOnSelect={false}>
        <MenuButton as={Button}>
          <BsBox2HeartFill />
        </MenuButton>
        <MenuList zIndex={3}>
          <MenuItem as="div">
            <RemoveBoxesButton
              labelIdentifier="Delete Boxes"
              onDeleteBoxes={onDeleteBoxes}
              actionsAreLoading={actionsAreLoading}
              selectedBoxes={selectedBoxes}
              key="remove-boxes"
            />
          </MenuItem>
          <MenuItem as="div">
            <ExportToCsvButton selectedBoxes={selectedBoxes} key="export-csv" />
          </MenuItem>
          <Menu>
            <AssignTagsButton
              selectedBoxes={selectedBoxes}
              key="assign-tags"
              onAssignTags={onAssignTags}
              allTagOptions={tagOptions}
            />
          </Menu>
          {/* Hide this button till remove tags functionality is ready for release */}
          {/* <Menu>
            <RemoveTagsButton
              selectedBoxes={selectedBoxes}
              key="remove-tags"
              onRemoveTags={onUnassignTags}
              allTagOptions={tagOptions}
              currentTagOptions={getSelectedBoxTags}
            />
          </Menu> */}
          <MenuItem as="div">
            <MakeLabelsButton selectedBoxes={selectedBoxes} key="make-labels" />
          </MenuItem>
        </MenuList>
      </Menu>,

      <div key="unassign-from-shipment">
        {thereIsABoxMarkedForShipmentSelected && (
          <Button onClick={() => onUnassignBoxesToShipment()} isDisabled={actionsAreLoading}>
            Remove from Shipment
          </Button>
        )}
      </div>,
    ],
    [
      locationOptions,
      onMoveBoxes,
      actionsAreLoading,
      shipmentOptions,
      onAssignBoxesToShipment,
      onDeleteBoxes,
      selectedBoxes,
      thereIsABoxMarkedForShipmentSelected,
      tagOptions,
      onUnassignBoxesToShipment,
      onAssignTags,
      // getSelectedBoxTags,
      // onUnassignTags,
    ],
  );

  return (
    <BoxesTable
      tableConfig={tableConfig}
      onRefetch={onRefetch}
      boxesQueryRef={boxesQueryRef}
      columns={availableColumns}
      actionButtons={actionButtons}
      setSelectedBoxes={setSelectedBoxes}
      onBoxRowClick={onBoxRowClick}
      selectedRowsArePending={actionsAreLoading}
    />
  );
}

export default BoxesActionsAndTable;
