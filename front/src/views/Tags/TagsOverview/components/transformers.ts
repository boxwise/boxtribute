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
  createdOn?: Date;
  lastModifiedOn?: Date;
  deletedOn?: Date;
};

export const tagsRawToTableDataTransformer = (tagsRawData: TagsQuery) => {
  return (
    tagsRawData.base?.tags
      ?.map(
        ({
          id,
          name,
          type,
          color,
          description,
          taggedResources,
          createdOn,
          lastModifiedOn,
          deletedOn,
        }) => {
          return {
            id,
            name,
            application: type,
            description,
            color: color || "",
            totalTaggedItemsCount: taggedResources?.length || 0,
            createdOn: createdOn ? new Date(createdOn) : undefined,
            lastModifiedOn: lastModifiedOn ? new Date(lastModifiedOn) : undefined,
            deletedOn: deletedOn ? new Date(deletedOn) : undefined,
          } satisfies TagRow;
        },
      )
      .filter((tag) => tag !== undefined && !tag.deletedOn) || []
  );
};
