import { CellProps } from "react-table";
import { isDate } from "date-fns";
import { chakra } from "@chakra-ui/react";

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
