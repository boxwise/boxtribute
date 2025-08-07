import {
  Button,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
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
import { AddIcon } from "@chakra-ui/icons";
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
  const [isLargerThan964] = useMediaQuery("(min-width: 964px)");
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
        (box) => box.values.shipment !== null && box.values.state === "MarkedForShipment",
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
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />
      <SelectButton
        label="Transfer"
        options={shipmentOptions}
        onSelect={onAssignBoxesToShipment}
        icon={<BiNetworkChart />}
        isDisabled={actionsAreLoading || shipmentOptions.length === 0}
        key="assign-to-shipment"
      />
      <Link to="create" key="box-create">
        <Button leftIcon={<AddIcon />} borderRadius="0" iconSpacing={isLargerThan964 ? 2 : 0}>
          {isLargerThan964 && <Text>Create Box</Text>}
        </Button>
      </Link>
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
      </Menu>
      <div key="unassign-from-shipment">
        {thereIsABoxMarkedForShipmentSelected && (
          <Button onClick={() => onUnassignBoxesToShipment()} isDisabled={actionsAreLoading}>
            Remove from Shipment
          </Button>
        )}
      </div>
    </ButtonGroup>
  );
}
export default BoxesActions;
