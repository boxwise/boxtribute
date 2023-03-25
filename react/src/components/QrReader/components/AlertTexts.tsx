import { chakra, Text } from "@chakra-ui/react";

export interface INotInStockAlertTextProps {
  notInStockBoxes: any[];
}

export function NotInStockAlertText({ notInStockBoxes }: INotInStockAlertTextProps) {
  return (
    <Text>
      A box must be in the InStock state to be assigned to a shipment.
      <br />
      {notInStockBoxes.length === 1 ? (
        <>
          <chakra.span fontWeight="bold">Box {notInStockBoxes[0].labelIdentifier}</chakra.span> is
          not InStock.
        </>
      ) : (
        <>
          <chakra.span fontWeight="bold">{notInStockBoxes.length} Boxes</chakra.span> are not
          InStock.
        </>
      )}
    </Text>
  );
}
