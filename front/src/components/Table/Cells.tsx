import { CellProps } from "react-table";
import { isDate } from "date-fns";
import { Box, chakra, Popover } from "@chakra-ui/react";
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
      {value.name || value}{" "}
      {(row.original.holdsStandardProduct || row.original.isStandard) && (
        <Popover.Root closeOnEscape closeOnInteractOutside lazyMount unmountOnExit>
          <Popover.Trigger>
            <Box onClick={(e) => e.stopPropagation()}>
              <BsFillCheckCircleFill color="#659A7E" size={18} />
            </Box>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content w={"100%"}>
              <Popover.Arrow />
              <Popover.Body onClick={(e) => e.stopPropagation()}>
                This product is part of the ASSORT standard
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>
      )}
    </chakra.span>
  );
}
