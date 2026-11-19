import { CellProps } from "react-table";
import { chakra, Tooltip } from "@chakra-ui/react";
import { MdWarning } from "react-icons/md";
import { BeneficiaryRow } from "./types";
import { formatAge } from "./transformers";

export function SurnameCell({ value, row }: CellProps<BeneficiaryRow, string>) {
  return (
    <chakra.span display="inline-flex" alignItems="center" gap={1}>
      {!row.original.signed && (
        <Tooltip label="Not signed">
          <span>
            <MdWarning aria-label="Not signed" color="#DD6B20" size="1em" />
          </span>
        </Tooltip>
      )}
      <chakra.span fontWeight={row.original.isFamilyHead ? "bold" : "normal"}>{value}</chakra.span>
    </chakra.span>
  );
}

export function FirstNameCell({ value, row }: CellProps<BeneficiaryRow, string>) {
  return (
    <chakra.span fontWeight={row.original.isFamilyHead ? "bold" : "normal"}>{value}</chakra.span>
  );
}

export function GenderCell({ value }: CellProps<BeneficiaryRow, string | null>) {
  return <chakra.span>{value === "Diverse" ? "" : value}</chakra.span>;
}

export function AgeCell({ value }: CellProps<BeneficiaryRow, number | null>) {
  return <chakra.span>{formatAge(value)}</chakra.span>;
}

/** The dates of beneficiaries have no time information */
export function BeneficiaryDateCell({ value }: CellProps<BeneficiaryRow, Date | null>) {
  return (
    <chakra.span>
      {value instanceof Date && !Number.isNaN(value.getTime())
        ? value.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })
        : ""}
    </chakra.span>
  );
}
