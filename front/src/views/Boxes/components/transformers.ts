import { differenceInDays } from "date-fns";
import { BoxesForBoxesViewQuery, BoxesForBoxesViewQueryVariables } from "types/generated/graphql";
import { Filters } from "react-table";
import { BoxRow } from "./types";

export const boxesRawDataToTableDataTransformer = (boxesQueryResult: BoxesForBoxesViewQuery) =>
  boxesQueryResult.boxes.elements.map(
    (element) =>
      ({
        labelIdentifier: element.labelIdentifier,
        product: element.product!.name,
        gender: element.product!.gender,
        numberOfItems: element.numberOfItems,
        size: element.size?.label,
        state: element.state,
        location: element.location!.name,
        tags: element.tags,
        shipment: element.shipmentDetail?.shipment,
        comment: element.comment,
        age: element.createdOn ? differenceInDays(new Date(), new Date(element.createdOn)) : 0,
        lastModified: element.lastModifiedOn
          ? new Date(element.lastModifiedOn)
          : new Date(element.createdOn),
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
): BoxesForBoxesViewQueryVariables => {
  const variables: BoxesForBoxesViewQueryVariables = { baseId, filterInput: {} };
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
