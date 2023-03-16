import { VStack } from "@chakra-ui/react";
import { AiFillMinusCircle } from "react-icons/ai";
import { Row } from "react-table";

interface IRemoveBoxCellProps {
  row: Row<any>;
  onRemoveIconClick: (id: string) => void;
}

export function RemoveBoxCell({ row, onRemoveIconClick }: IRemoveBoxCellProps) {
  return (
    <VStack align="start">
      <AiFillMinusCircle
        onClick={() => onRemoveIconClick(row?.original.labelIdentifier)}
        type="solid"
        size={20}
        style={{ cursor: "pointer", color: "red", fill: "red" }}
      />
    </VStack>
  );
}
