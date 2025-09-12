import { CellProps } from "react-table";
import { isDate } from "date-fns";
import {
  Box,
  chakra,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { BsFillCheckCircleFill } from "react-icons/bs";

export function DateCell({ value }: CellProps<any>) {
  return (
    <chakra.span>
      {isDate(value) &&
        value.getTime() > new Date(0).getTime() &&
        value.toLocaleString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
    </chakra.span>
  );
}

export function ProductWithSPCheckmarkCell({ value, row }: CellProps<any>) {
  return (
    <chakra.span display="flex" gap={2}>
      {value.name}{" "}
      {(row.original.holdsStandardProduct || row.original.isStandard) && (
        <Popover closeOnEsc closeOnBlur isLazy>
          <PopoverTrigger>
            <Box onClick={(e) => e.stopPropagation()}>
              <BsFillCheckCircleFill color="#659A7E" size={18} />
            </Box>
          </PopoverTrigger>
          <PopoverContent w={"100%"}>
            <PopoverArrow />
            <PopoverBody onClick={(e) => e.stopPropagation()}>
              This product is part of the ASSORT standard
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </chakra.span>
  );
}
