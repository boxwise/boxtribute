import { chakra } from "@chakra-ui/react";

export function ShipmentOption(props) {
  const { isDisabled, innerProps, data } = props;

  if (isDisabled) {
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
