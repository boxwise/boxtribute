import { ReactNode } from "react";
import { TagApplicationOption } from "views/Tags/CreateTag/components/CreateTagForm";
import { TagsQuery } from "./TagsContainer";

export type TagRow = {
  id: string;
  name: ReactNode;
  application: TagApplicationOption;
  description?: string | null;
  totalTaggedItemsCount: number;
  colour: string;
};

export const tagsRawToTableDataTransformer = (tagsRawData: TagsQuery) => {
  return (
    tagsRawData.base?.tags
      ?.map(({ id, name, type, color, description, taggedResources }) => {
        return {
          id,
          name,
          application: type,
          description,
          colour: color || "",
          totalTaggedItemsCount: taggedResources?.length || 0,
        } satisfies TagRow;
      })
      .filter((tag) => tag !== undefined) || []
  );
};
