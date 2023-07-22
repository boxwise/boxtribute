import { ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { IBoxBasicFields } from "types/graphql-local-only";

export interface INotInStockAlertTextProps {
  notInStockBoxes: IBoxBasicFields[];
}

export function NotInStockAlertText({ notInStockBoxes }: INotInStockAlertTextProps) {
  return (
    <Text>
      A box must be in the InStock state to be assigned to a shipment.
      <br />
      {notInStockBoxes.length === 1 ? (
        <>
          <Text as="b">Box {notInStockBoxes[0].labelIdentifier}</Text> is not InStock.
        </>
      ) : (
        <>
          <Text as="b">{notInStockBoxes.length} Boxes</Text> are not InStock.
        </>
      )}
    </Text>
  );
}

export interface IFailedBoxesFromAssingToShipmentAlertProps {
  failedBoxes: IBoxBasicFields[];
}

export function FailedBoxesFromAssingToShipmentAlert({
  failedBoxes,
}: IFailedBoxesFromAssingToShipmentAlertProps) {
  return (
    <Text>
      The following boxes were not assigned to the shipment:
      <UnorderedList>
        {failedBoxes.map((box) => (
          <ListItem fontWeight="bold">{box.labelIdentifier}</ListItem>
        ))}
      </UnorderedList>
    </Text>
  );
}

export interface IFailedBoxesFromMoveBoxesAlertProps {
  failedBoxes: string[];
}

export function FailedBoxesFromMoveBoxesAlert({
  failedBoxes,
}: IFailedBoxesFromMoveBoxesAlertProps) {
  return (
    <Text>
      The following boxes were not moved:
      <UnorderedList>
        {failedBoxes.map((labelIdentifier) => (
          <ListItem fontWeight="bold">{labelIdentifier}</ListItem>
        ))}
      </UnorderedList>
    </Text>
  );
}
