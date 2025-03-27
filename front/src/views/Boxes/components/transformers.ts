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
    default:
      return "";
  }
};

export const prepareBoxesForBoxesViewQueryVariables = (
  baseId: string,
  columnFilters: Filters<any>,
): BoxesForBoxesViewVariables => {
  const variables: BoxesForBoxesViewVariables = { baseId, filterInput: {} };
  const refetchFilters = columnFilters.filter((filter) => filter.id === "state");
  if (refetchFilters.length > 0) {
    const filterInput = refetchFilters.reduce(
      (acc, filter) => ({ ...acc, [filterIdToGraphQLVariable(filter.id)]: filter.value }),
      {},
    );
    variables.filterInput = filterInput;
  }
  return variables;
};
