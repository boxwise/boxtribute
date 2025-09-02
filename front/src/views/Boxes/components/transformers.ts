import { differenceInDays } from "date-fns";
import { Filters } from "react-table";
import { BoxRow } from "./types";
import { BoxesForBoxesViewQuery, BoxesForBoxesViewVariables } from "queries/types";

export const boxesRawDataToTableDataTransformer = (boxesQueryResult: BoxesForBoxesViewQuery) =>
  boxesQueryResult.boxes.elements
    .filter((element) => !element.deletedOn)
    .map(
      (element) =>
        ({
          id: element.id,
          labelIdentifier: element.labelIdentifier,
          product: element.product?.name,
          productCategory: element.product?.category.name,
          gender: element.product?.gender,
          numberOfItems: element.numberOfItems,
          size: element.size?.label,
          state: element.state,
          location: element.location!.name,
          tags: element.tags,
          shipment: element.shipmentDetail?.shipment,
          holdsStandardProduct: element.product?.type === "StandardInstantiation",
          comment: element.comment,
          age: element.createdOn ? differenceInDays(new Date(), new Date(element.createdOn)) : 0,
          lastModified: element.lastModifiedOn
            ? new Date(element.lastModifiedOn)
            : new Date(element.createdOn || new Date()),
          createdBy: element.createdBy?.name,
          lastModifiedBy: element.lastModifiedBy?.name,
        }) as BoxRow,
    );

export const filterIdToGraphQLVariable = (filterID: string) => {
  switch (filterID) {
    case "state":
      return "states";
    case "tags":
      return "tagIds";
    // Other filters not yet supported by backend
    default:
      return "";
  }
};

export const prepareBoxesForBoxesViewQueryVariables = (
  baseId: string,
  columnFilters: Filters<any>,
  paginationInput: number = 100000,
): BoxesForBoxesViewVariables => {
  const variables: BoxesForBoxesViewVariables = {
    baseId,
    filterInput: {},
    paginationInput,
  };

  // Only handle state and tagIds filters - other types not yet supported by backend
  if (columnFilters.length > 0) {
    const filterInput = columnFilters.reduce((acc, filter) => {
      const graphqlField = filterIdToGraphQLVariable(filter.id);
      if (graphqlField) {
        let processedValue;

        if (filter.id === "tags") {
          // For tags, extract IDs from tag objects or use string IDs directly
          const values = Array.isArray(filter.value) ? filter.value : [filter.value];
          processedValue = values
            .map((tag) => {
              if (typeof tag === "object" && tag !== null) {
                return String(tag.id || tag.value || tag);
              }
              return String(tag);
            })
            .filter(Boolean);
        } else if (filter.id === "state") {
          // For states, ensure they're strings
          const values = Array.isArray(filter.value) ? filter.value : [filter.value];
          processedValue = values.map(String);
        } else {
          // Handle other filter types
          processedValue = Array.isArray(filter.value) ? filter.value : [filter.value];
        }

        acc[graphqlField] = processedValue;
      }
      return acc;
    }, {} as any);
    variables.filterInput = filterInput;
  }

  return variables;
};
