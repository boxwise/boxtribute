import { chakra } from "@chakra-ui/react";
import { IDropdownOption } from "./SelectField";
import { GroupBase, OptionProps } from "chakra-react-select";

export function ShipmentOption({
  isDisabled,
  innerProps,
  data,
}: OptionProps<
  IDropdownOption | ((prevState: IDropdownOption) => IDropdownOption),
  false,
  GroupBase<IDropdownOption | ((prevState: IDropdownOption) => IDropdownOption)>
>) {
  if (isDisabled) {
    return null;
  }
  // supporting this scenario is not required
  if (data != null && typeof data === "function") {
    return null;
  }

  const [base, organisation] = (data.label as string).split("-").map((part) => part.trim());

  return (
    <chakra.div
      {...innerProps}
      px={2}
      py={2}
      _hover={{
        backgroundColor: "lightblue",
        cursor: "pointer",
      }}
    >
      <chakra.div role="button">
        <chakra.span fontWeight="semibold">{base}</chakra.span>{" "}
        <chakra.span fontWeight="normal">{organisation}</chakra.span>
      </chakra.div>
      <chakra.div style={{ fontSize: "0.8em", color: "gray" }}>ID: {data.subTitle}</chakra.div>
    </chakra.div>
  );
}
