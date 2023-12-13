import { differenceInDays } from "date-fns";
import { BoxesForBoxesViewQuery } from "types/generated/graphql";
import { BoxRow } from "./types";

export const boxesRawDataToTableDataTransformer = (boxesQueryResult: BoxesForBoxesViewQuery) =>
  boxesQueryResult.boxes.elements.map(
    (element) =>
      ({
        labelIdentifier: element.labelIdentifier,
        product: element.product!.name,
        gender: element.product!.gender,
        numberOfItems: element.numberOfItems,
        size: element.size.label,
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
