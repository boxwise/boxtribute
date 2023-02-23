import { VStack } from "@chakra-ui/react";
import { AiFillMinusCircle } from "react-icons/ai";
import { Row } from "react-table";

interface IRemoveBoxCellProps {
  row: Row<any>;
  onClick: (row: Row<any>) => void;
}

export function RemoveBoxCell({ row, onClick }: IRemoveBoxCellProps) {
  return (
    <VStack align="start">
      <AiFillMinusCircle
        onClick={() => onClick(row)}
        type="solid"
        size={20}
        style={{ cursor: "pointer", color: "red", fill: "red" }}
      />
    </VStack>
  );
}
