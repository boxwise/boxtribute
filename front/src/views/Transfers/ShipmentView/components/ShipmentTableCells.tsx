import { VStack } from "@chakra-ui/react";
import { AiFillMinusCircle } from "react-icons/ai";
import { Row } from "react-table";

interface IRemoveBoxCellProps {
  row: Row<any>;
  onRemoveIconClick: (id: string) => void;
  isLoadingMutation: boolean | undefined;
}

export function RemoveBoxCell({ row, onRemoveIconClick, isLoadingMutation }: IRemoveBoxCellProps) {
  return (
    <VStack align="start">
      <AiFillMinusCircle
        onClick={
          !isLoadingMutation ? () => onRemoveIconClick(row?.original.labelIdentifier) : undefined
        }
        type="solid"
        size={20}
        style={{ cursor: "pointer", color: "red", fill: "red" }}
      />
    </VStack>
  );
}
