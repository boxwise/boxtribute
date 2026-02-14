import { useCallback } from "react";
import { Row } from "react-table";
import { TagRow } from "../TagsOverview/components/transformers";
import { useDeleteTags } from "hooks/useDeleteTags";

export function useTagsActions(selectedTags: Row<TagRow>[]) {
  // Delete Tags
  const { deleteTags, isLoading: isDeleteTagsLoading } = useDeleteTags();
  const onDeleteTags = useCallback(() => {
    deleteTags(
      selectedTags.map((tagRow) => parseInt(tagRow.original.id)),
      true,
      true,
    );
  }, [deleteTags, selectedTags]);

  return {
    onDeleteTags,
    actionsAreLoading: isDeleteTagsLoading,
  };
}
