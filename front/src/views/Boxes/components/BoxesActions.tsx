import { Button, ButtonGroup, IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SelectButton } from "./ActionButtons";
import { FaDollyFlatbed } from "react-icons/fa";
import RemoveBoxesButton from "./RemoveBoxesButton";
import { Row } from "react-table";
import { BoxRow } from "./types";
import ExportToCsvButton from "./ExportToCsvButton";
import MakeLabelsButton from "./MakeLabelsButton";
import AssignTagsButton from "./AssignTagsButton";
import { IDropdownOption } from "components/Form/SelectField";
import RemoveTagsButton from "./RemoveTagsButton";
import { useMemo } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { BiMinusCircle, BiNetworkChart } from "react-icons/bi";
import { SlOptions } from "react-icons/sl";

type BoxesActionsProps = {
  selectedBoxes: Row<BoxRow>[];
  onMoveBoxes: (locationId: string) => void;
  locationOptions: { label: string; value: string }[];
  onDeleteBoxes: () => void;
  onAssignTags: (tagIds: string[]) => void;
  onUnassignTags: (tagIds: string[]) => void;
  tagOptions: IDropdownOption[];
  onAssignBoxesToShipment: (shipmentId: string) => void;
  shipmentOptions: { label: string; value: string }[];
  onUnassignBoxesToShipment: () => void;
  actionsAreLoading: boolean;
};

function BoxesActions({
  selectedBoxes,
  onMoveBoxes,
  locationOptions,
  onDeleteBoxes,
  onAssignTags,
  onUnassignTags,
  tagOptions,
  onAssignBoxesToShipment,
  shipmentOptions,
  onUnassignBoxesToShipment,
  actionsAreLoading,
}: BoxesActionsProps) {
  // Used for remove tags
  const getSelectedBoxTags = useMemo(() => {
    const selectedBoxTags = selectedBoxes.map((box) => box.values.tags);
    const tagsToFilter = new Set(selectedBoxTags.flat().map((tag) => tag.id));
    const commonTags = tagOptions.filter((tag) => tagsToFilter.has(tag.value));
    return commonTags;
  }, [selectedBoxes, tagOptions]);

  // Used for remove from shipment
  const thereIsABoxMarkedForShipmentSelected = useMemo(
    () =>
      selectedBoxes.some(
        (box) => box.values.shipment !== null && box.values.state.name === "MarkedForShipment",
      ),
    [selectedBoxes],
  );

  return (
    <ButtonGroup mb={2}>
      <Menu key="box-actions" closeOnSelect={false}>
        <MenuButton as={IconButton} aria-label="Box actions" icon={<SlOptions />} />
        <MenuList zIndex={3}>
          <MenuItem as="div">
            <Link to="create">
              <Button padding={1} variant="ghost" leftIcon={<AddIcon />} iconSpacing={2}>
                Create Box
              </Button>
            </Link>
          </MenuItem>
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
          {thereIsABoxMarkedForShipmentSelected && (
            <MenuItem as="div">
              <Button
                onClick={() => onUnassignBoxesToShipment()}
                isDisabled={actionsAreLoading}
                padding={1}
                variant="ghost"
                leftIcon={<BiMinusCircle />}
                iconSpacing={2}
                width="100%"
                key="unassign-from-shipment"
              >
                Remove from Shipment
              </Button>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
      <SelectButton
        label="Transfer"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<BiNetworkChart />}
        isDisabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />
      <SelectButton
        label="Move"
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaDollyFlatbed />}
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />
    </ButtonGroup>
  );
}
export default BoxesActions;
