import { Column, Row } from "react-table";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAssignBoxesToShipment } from "hooks/useAssignBoxesToShipment";
import { IDeleteBoxResultKind, useDeleteBoxes } from "hooks/useDeleteBoxes";
import { IBoxBasicFields } from "types/graphql-local-only";
import { Button, Menu, MenuButton, MenuList, MenuItem, Text } from "@chakra-ui/react";
import { useUnassignBoxesFromShipments } from "hooks/useUnassignBoxesFromShipments";
import { useNotification } from "hooks/useNotification";
import { QueryRef } from "@apollo/client";
import { IUseTableConfigReturnType } from "hooks/hooks";
import { BoxRow } from "./types";
import { SelectButton } from "./ActionButtons";
import BoxesTable from "./BoxesTable";
import RemoveBoxesButton from "./RemoveBoxesButton";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";
import ExportToCsvButton from "./ExportToCsvButton";
import { FaTruckArrowRight } from "react-icons/fa6";
import { BsBox2HeartFill } from "react-icons/bs";
import MakeLabelsButton from "./MakeLabelsButton";
import AssignTagsButton from "./AssignTagsButton";
import { IDropdownOption } from "components/Form/SelectField";
import { useAssignTags } from "hooks/useAssignTags";
import RemoveTagsButton from "./RemoveTagsButton";
import { useUnassignTags } from "hooks/useUnassignTags";
import { AddIcon } from "@chakra-ui/icons";

export interface IBoxesActionsAndTableProps {
  isBackgroundFetchOfBoxesLoading: boolean;
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  locationOptions: { label: string; value: string }[];
  shipmentOptions: { label: string; value: string }[];
  tagOptions: IDropdownOption[];
  availableColumns: Column<BoxRow>[];
}

function BoxesActionsAndTable({
  isBackgroundFetchOfBoxesLoading,
  tableConfig,
  onRefetch,
  boxesQueryRef,
  locationOptions,
  shipmentOptions,
  tagOptions,
  availableColumns,
}: IBoxesActionsAndTableProps) {
  const { createToast } = useNotification();

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
        setSelectedBoxes([]);
      });
    },
    [createToast, assignBoxesToShipment, selectedBoxes, setSelectedBoxes],
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
      setSelectedBoxes([]);
    }
  }, [createToast, flushResult, unassignBoxesFromShipmentsResult, setSelectedBoxes]);

  // Delete Boxes
  const { deleteBoxes, isLoading: isDeleteBoxesLoading } = useDeleteBoxes();
  const onDeleteBoxes = useCallback(() => {
    deleteBoxes(selectedBoxes.map((box) => box.values as IBoxBasicFields)).then(
      (deleteBoxesResult) => {
        if (deleteBoxesResult.kind === IDeleteBoxResultKind.SUCCESS) setSelectedBoxes([]);
      },
    );
  }, [deleteBoxes, selectedBoxes, setSelectedBoxes]);

  // Assign Tags to Boxes
  const { assignTags, isLoading: isAssignTagsLoading } = useAssignTags();
  const onAssignTags = useCallback(
    (tagIds: string[]) => {
      assignTags(
        selectedBoxes.map((box) => box.values.labelIdentifier),
        tagIds.map((id) => parseInt(id, 10)),
      );
    },
    [assignTags, selectedBoxes],
  );

  // Unassign tags from boxes
  const { unassignTags, isLoading: isUnassignTagsLoading } = useUnassignTags();
  const onUnassignTags = useCallback(
    (tagIds: string[]) => {
      if (tagIds.length > 0) {
        unassignTags(
          selectedBoxes.map((box) => box.values.labelIdentifier),
          tagIds.map((id) => parseInt(id, 10)),
        );
      }
    },
    [unassignTags, selectedBoxes],
  );

  const actionsAreLoading =
    isAssignBoxesToShipmentLoading ||
    isUnassignBoxesFromShipmentsLoading ||
    isDeleteBoxesLoading ||
    isAssignTagsLoading ||
    isUnassignTagsLoading;

  const actionButtons = useMemo(
    () => [
      <SelectButton
        label="Assign to Shipment"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<FaTruckArrowRight />}
        isDisabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />,
      <Link to="create" key="box-create">
        <Button leftIcon={<AddIcon />} borderRadius="0" iconSpacing={[0, 0, 2]}>
          <Text display={["none", "none", "block"]}>Create Box</Text>
        </Button>
      </Link>,
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
          <Menu>
            <RemoveTagsButton
              selectedBoxes={selectedBoxes}
              key="remove-tags"
              onRemoveTags={onUnassignTags}
              allTagOptions={getSelectedBoxTags}
              currentTagOptions={getSelectedBoxTags}
            />
          </Menu>
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
      actionsAreLoading,
      shipmentOptions,
      onAssignBoxesToShipment,
      onDeleteBoxes,
      selectedBoxes,
      thereIsABoxMarkedForShipmentSelected,
      tagOptions,
      onUnassignBoxesToShipment,
      onAssignTags,
      getSelectedBoxTags,
      onUnassignTags,
    ],
  );

  return (
    <BoxesTable
      isBackgroundFetchOfBoxesLoading={isBackgroundFetchOfBoxesLoading}
      tableConfig={tableConfig}
      onRefetch={onRefetch}
      boxesQueryRef={boxesQueryRef}
      columns={availableColumns}
      locationOptions={locationOptions}
      actionButtons={actionButtons}
      selectedBoxes={selectedBoxes}
      setSelectedBoxes={setSelectedBoxes}
      selectedRowsArePending={actionsAreLoading}
    />
  );
}

export default BoxesActionsAndTable;
