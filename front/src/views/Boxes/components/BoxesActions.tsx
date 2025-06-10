import { Button, ButtonGroup, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
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

type BoxesActionsProps = {
  selectedBoxes: Row<BoxRow>[];
  onMoveBoxes: (locationId: string) => void;
  locationOptions: { label: string; value: string }[];
  onDeleteBoxes: () => void;
  onAssignTags: (tagIds: string[]) => void;
  onUnassignTags: (tagIds: string[]) => void;
  tagOptions: IDropdownOption[];
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
  actionsAreLoading,
}: BoxesActionsProps) {
  // Used for remove tags
  const getSelectedBoxTags = useMemo(() => {
    const selectedBoxTags = selectedBoxes.map((box) => box.values.tags);
    const tagsToFilter = new Set(selectedBoxTags.flat().map((tag) => tag.id));
    const commonTags = tagOptions.filter((tag) => tagsToFilter.has(tag.value));
    return commonTags;
  }, [selectedBoxes, tagOptions]);

  return (
    <ButtonGroup mb={2}>
      <SelectButton
        label="Move to ..."
        options={locationOptions}
        onSelect={onMoveBoxes}
        icon={<FaDollyFlatbed />}
        isDisabled={actionsAreLoading || locationOptions.length === 0}
        key="move-to"
      />
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
    </ButtonGroup>
  );
}
export default BoxesActions;
