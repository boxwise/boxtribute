import { differenceInDays } from "date-fns";
import { Filters } from "react-table";
import { BoxRow } from "./types";
import { BoxesForBoxesViewQuery, BoxesForBoxesViewVariables } from "queries/types";
import { boxStateIds, genderIds } from "utils/constants";

export const boxesRawDataToTableDataTransformer = (boxesQueryResult: BoxesForBoxesViewQuery) =>
  boxesQueryResult.boxes.elements
    .filter((element) => !element.deletedOn)
    .map(
      (element) =>
        ({
          id: element.id,
          labelIdentifier: element.labelIdentifier,
          product: { name: element.product?.name, id: element.product?.id },
          productCategory: {
            name: element.product?.category.name,
            id: element.product?.category.id,
          },
          gender: {
            name: element.product?.gender,
            id: element.product?.gender ? genderIds[element.product.gender] : undefined,
          },
          numberOfItems: element.numberOfItems,
          size: { name: element.size?.label, id: element.size?.id },
          state: { name: element.state, id: boxStateIds[element.state] },
          location: { name: element.location?.name, id: element.location?.id },
          tags: element.tags,
          shipment: element.shipmentDetail?.shipment,
          holdsStandardProduct: element.product?.type === "StandardInstantiation",
          hasQrCode: !!element.qrCode?.code,
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
  paginationInput: number = 100000,
): BoxesForBoxesViewVariables => {
  const variables: BoxesForBoxesViewVariables = {
    baseId,
    filterInput: {},
    paginationInput,
  };
  const refetchFilters = columnFilters.filter((filter) => filter.id === "state");
  if (refetchFilters.length > 0) {
    // Find GraphQL BoxState enum values matching the selected filter IDs
    const filterInput = refetchFilters.reduce(
      (acc, filter) => ({
        ...acc,
        [filterIdToGraphQLVariable(filter.id)]: filter.value.map((id: string) =>
          Object.keys(boxStateIds).find((name) => boxStateIds[name] === id),
        ),
      }),
      {},
    );
    variables.filterInput = filterInput;
  }
  return variables;
};
