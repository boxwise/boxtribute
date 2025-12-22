import { useSuspenseQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { SelectColumnFilter } from "components/Table/Filter";
import { useMemo } from "react";
import { Column } from "react-table";
import { useAtomValue } from "jotai";
import { useTableConfig } from "hooks/useTableConfig";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { graphql, ResultOf, VariablesOf } from "../../../../../../graphql/graphql";
import { BOX_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT } from "queries/fragments";
import { TagRow, tagsRawToTableDataTransformer } from "./transformers";
import { Tag, TagLabel } from "@chakra-ui/react";
import { colorIsBright } from "utils/helpers";
import { Style } from "victory";
import { TagsTable } from "./TagsTable";

export const TAGS_QUERY = graphql(
  `
    query TagsForTagsView($baseId: ID!) {
      base(id: $baseId) {
        tags(resourceType: Box) {
          taggedResources {
            ...BoxFields
          }
          ...TagBasicFields
        }
      }
    }
  `,
  [TAG_BASIC_FIELDS_FRAGMENT, BOX_FIELDS_FRAGMENT],
);

export const TAG_QUERY = graphql(
  `
    query TagForUpdateTagView($tagId: ID!) {
      tag(id: $tagId) {
        ...TagBasicFields
      }
    }
  `,
  [TAG_BASIC_FIELDS_FRAGMENT],
);

export type TagsForTagsContainerVariables = VariablesOf<typeof TAGS_QUERY>;

export type TagsQuery = ResultOf<typeof TAGS_QUERY>;

export function TagsContainer() {
  const navigate = useNavigate();
  const baseId = useAtomValue(selectedBaseIdAtom);

  const tableConfigKey = `bases/${baseId}/tags`;
  const tableConfig = useTableConfig({
    tableConfigKey,
    defaultTableConfig: {
      columnFilters: [],
      sortBy: [{ id: "name", desc: false }],
      hiddenColumns: [],
    },
  });

  const onRowClick = (tagId: string) => {
    navigate(`/bases/${baseId}/tags/${tagId}`);
  };

  // fetch Tags data
  const {
    data: tagsRawData,
    error,
    refetch,
  } = useSuspenseQuery(TAGS_QUERY, {
    variables: { baseId },
  });

  const availableColumns: Column<TagRow>[] = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        id: "name",
        Filter: SelectColumnFilter,
        Cell: (args) => {
          const { row } = args;
          return (
            <Tag
              bg={Style.toTransformString(row.original.colour)}
              color={colorIsBright(row.original.colour) ? "black" : "white"}
            >
              <TagLabel>{row.original.name}</TagLabel>
            </Tag>
          );
        },
        filter: "includesOneOfMultipleStrings",
        sortType: (rowA, rowB) => {
          const a = rowA.values.name.toLowerCase();
          const b = rowB.values.name.toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        Header: "Application",
        accessor: "application",
        id: "application",
        Filter: SelectColumnFilter,
        filter: "includesOneOfMultipleStrings",
      },
      {
        Header: "Description",
        accessor: "description",
        id: "description",
      },
      {
        Header: "Items Tagged",
        accessor: "totalTaggedItemsCount",
        id: "totalTaggedItemsCount",
        disableFilters: true,
      },
    ],
    [],
  );

  if (error) throw error;

  return (
    <TagsTable
      tableConfig={tableConfig}
      tableData={tagsRawToTableDataTransformer(tagsRawData)}
      refetchData={refetch}
      columns={availableColumns}
      onRowClick={onRowClick}
    />
  );
}
