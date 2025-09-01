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
    // Location filtering is not supported in FilterBoxInput schema
    case "productCategory":
      return "productCategoryId";
    case "product":
      return "productId";
    case "size":
      return "sizeId";
    case "gender":
      return "productGender";
    case "tags":
      return "tagIds";
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

  // Handle all filter types, not just state
  if (columnFilters.length > 0) {
    const filterInput = columnFilters.reduce((acc, filter) => {
      const graphqlField = filterIdToGraphQLVariable(filter.id);
      if (graphqlField) {
        // Handle different value types
        if (Array.isArray(filter.value)) {
          acc[graphqlField] = filter.value;
        } else {
          acc[graphqlField] = [filter.value];
        }
      }
      return acc;
    }, {} as any);
    variables.filterInput = filterInput;
  }

  return variables;
};
