import { chakra } from "@chakra-ui/react";

export function ShipmentOption(props) {
  return !props.isDisabled ? (
    <chakra.div
      {...props.innerProps}
      px={2}
      py={2}
      _hover={{
        backgroundColor: "lightblue",
        cursor: "pointer",
      }}
    >
      <chakra.div>
        <chakra.strong>{props.data.label}</chakra.strong>
      </chakra.div>
      <chakra.div style={{ fontSize: "0.8em", color: "gray" }}>
        ID: {props.data.subTitle}
      </chakra.div>
    </chakra.div>
  ) : null;
}
