import { List, Text } from "@chakra-ui/react";
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
    <Text as="div">
      The following boxes were not assigned to the shipment:
      <List.Root as="ul">
        {failedBoxes.map((box) => (
          <List.Item key={box.labelIdentifier} fontWeight="bold">
            {box.labelIdentifier}
          </List.Item>
        ))}
      </List.Root>
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
    <Text as="div">
      The following boxes were not moved:
      <List.Root as="ul">
        {failedBoxes.map((labelIdentifier) => (
          <List.Item key={labelIdentifier} fontWeight="bold">
            {labelIdentifier}
          </List.Item>
        ))}
      </List.Root>
    </Text>
  );
}

export function FailedBoxesFromAssignTagsAlert({
  failedBoxes,
}: IFailedBoxesFromMoveBoxesAlertProps) {
  return (
    <Text as="div">
      The following boxes were not assigned tags:
      <List.Root as="ul">
        {failedBoxes.map((labelIdentifier) => (
          <List.Item key={labelIdentifier} fontWeight="bold">
            {labelIdentifier}
          </List.Item>
        ))}
      </List.Root>
    </Text>
  );
}
