import { CellProps } from "react-table";
import { ProductRow } from "./transformers";
import { chakra, Tooltip } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";

export function AllProductsCell({ row, value }: CellProps<ProductRow, string>) {
  if (row.original.isStandard) {
    return (
      <Tooltip label="This product is part of the ASSORT standard." aria-label="Standard Product">
        <chakra.span display="inline-flex" alignItems="center" gap={2}>
          {value}
          <FaCheckCircle color="green" />
        </chakra.span>
      </Tooltip>
    );
  }
  return <chakra.span>{value}</chakra.span>;
}
