import { Button, ButtonGroup } from "@chakra-ui/react";
import { Link } from "react-router-dom";
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
      <Link to="create">
        <Button borderRadius="0" leftIcon={<AddIcon />} iconSpacing={2}>
          Create Tag
        </Button>
      </Link>
      <RemoveTagsButton
        labelIdentifier="Delete Tags"
        onDeleteTags={onDeleteTags}
        actionsAreLoading={actionsAreLoading}
        selectedTags={selectedTags}
        key="remove-tags"
      />
    </ButtonGroup>
  );
}
