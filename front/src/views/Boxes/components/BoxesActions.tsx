import { Button, ButtonGroup, Menu, Portal } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SelectButton } from "./ActionButtons";
import { FaDollyFlatbed } from "react-icons/fa";
import { BsBox2HeartFill } from "react-icons/bs";
import RemoveBoxesButton from "./RemoveBoxesButton";
import { Row } from "react-table";
import { BoxRow } from "./types";
import ExportToCsvButton from "./ExportToCsvButton";
import MakeLabelsButton from "./MakeLabelsButton";
import AssignTagsButton from "./AssignTagsButton";
import { IDropdownOption } from "components/Form/SelectField";
import RemoveTagsButton from "./RemoveTagsButton";
import { useMemo } from "react";
import { IoAdd } from "react-icons/io5";
import { BiNetworkChart } from "react-icons/bi";

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
      <SelectButton
        label="Move"
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaDollyFlatbed />}
        disabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />
      <SelectButton
        label="Transfer"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<BiNetworkChart />}
        disabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />
      <Menu.Root key="box-actions" closeOnSelect={false}>
        <Menu.Trigger asChild>
          <Button>
            <BsBox2HeartFill />
          </Button>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content zIndex={3}>
              <Menu.Item value="create" asChild>
                <Link to="create">
                  <Button padding={1} variant="ghost">
                    <IoAdd />
                    Create Box
                  </Button>
                </Link>
              </Menu.Item>
              <Menu.Item value="delete" asChild>
                <RemoveBoxesButton
                  labelIdentifier="Delete Boxes"
                  onDeleteBoxes={onDeleteBoxes}
                  actionsAreLoading={actionsAreLoading}
                  selectedBoxes={selectedBoxes}
                  key="remove-boxes"
                />
              </Menu.Item>
              <Menu.Item value="export" asChild>
                <ExportToCsvButton selectedBoxes={selectedBoxes} key="export-csv" />
              </Menu.Item>
              <Menu.Item value="assign-tags" asChild>
                <AssignTagsButton
                  selectedBoxes={selectedBoxes}
                  key="assign-tags"
                  onAssignTags={onAssignTags}
                  allTagOptions={tagOptions}
                />
              </Menu.Item>
              <Menu.Item value="remove-tags" asChild>
                <RemoveTagsButton
                  selectedBoxes={selectedBoxes}
                  key="remove-tags"
                  onRemoveTags={onUnassignTags}
                  allTagOptions={getSelectedBoxTags}
                  currentTagOptions={getSelectedBoxTags}
                />
              </Menu.Item>
              <Menu.Item value="make-labels" asChild>
                <MakeLabelsButton selectedBoxes={selectedBoxes} key="make-labels" />
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <div key="unassign-from-shipment">
        {thereIsABoxMarkedForShipmentSelected && (
          <Button onClick={() => onUnassignBoxesToShipment()} disabled={actionsAreLoading}>
            Remove from Shipment
          </Button>
        )}
      </div>
    </ButtonGroup>
  );
}
export default BoxesActions;
