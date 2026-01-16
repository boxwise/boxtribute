import { ReactNode } from "react";
import { TagApplicationOption } from "views/Tags/TagForm";
import { TagsQuery } from "./TagsContainer";

export type TagRow = {
  id: string;
  name: ReactNode;
  application: TagApplicationOption;
  description?: string | null;
  totalTaggedItemsCount: number;
  color: string;
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
          color: color || "",
          totalTaggedItemsCount: taggedResources?.length || 0,
        } satisfies TagRow;
      })
      .filter((tag) => tag !== undefined) || []
  );
};
