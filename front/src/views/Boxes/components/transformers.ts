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
        // untouched:
        //   element.history && element.history[0] && element.history[0].changeDate
        //     ? differenceInDays(new Date(), new Date(element.history[0].changeDate))
        //     : 0,
      }) as BoxRow,
  );
