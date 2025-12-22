import { Button, ButtonGroup, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { BsBox2HeartFill } from "react-icons/bs";
import { Row } from "react-table";
import { AddIcon } from "@chakra-ui/icons";
import { TagRow } from "./transformers";
import { RemoveTagsButton } from "./RemoveTagsButton";

type TagsActionsProps = {
  selectedTags: Row<TagRow>[];
  onDeleteTags: () => void;
  actionsAreLoading: boolean;
};

export function TagsActions({ selectedTags, onDeleteTags, actionsAreLoading }: TagsActionsProps) {
  return (
    <ButtonGroup mb={2}>
      <Menu key="tag-actions" closeOnSelect={false}>
        <MenuButton as={Button}>
          <BsBox2HeartFill />
        </MenuButton>
        <MenuList zIndex={3}>
          <MenuItem as="div">
            <Link to="create">
              <Button padding={1} variant="ghost" leftIcon={<AddIcon />} iconSpacing={2}>
                Create Tag
              </Button>
            </Link>
          </MenuItem>
          <MenuItem as="div">
            <RemoveTagsButton
              labelIdentifier="Delete Tags"
              onDeleteTags={onDeleteTags}
              actionsAreLoading={actionsAreLoading}
              selectedTags={selectedTags}
              key="remove-tags"
            />
          </MenuItem>
        </MenuList>
      </Menu>
    </ButtonGroup>
  );
}
