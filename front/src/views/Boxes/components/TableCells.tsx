import { CellProps } from "react-table";
import { VStack, Tag, TagLabel, Wrap, WrapItem, chakra } from "@chakra-ui/react";
import { Style } from "victory";
import { RiQrCodeLine } from "react-icons/ri";

import { colorIsBright } from "utils/helpers";

export function StateCell({ value }: CellProps<any>) {
  let color = "inherit";

  if (
    value === "MarkedForShipment" ||
    value === "InTransit" ||
    value === "Receiving" ||
    value === "Donated"
  ) {
    color = "blue.700";
  } else if (value === "InStock") {
    color = "green.700";
  } else if (value === "Scrap" || value === "Lost" || value === "NotDelivered") {
    color = "red.700";
  }

  return (
    <chakra.span as="b" color={color}>
      {value}
    </chakra.span>
  );
}

export function TagsCell({ value }: CellProps<any>) {
  return (
    <Wrap spacing={1}>
      {value.map((tag) => (
        <WrapItem key={tag.id}>
          <Tag
            bg={Style.toTransformString(tag.color)}
            color={colorIsBright(tag.color) ? "black" : "white"}
          >
            <TagLabel>{tag.name}</TagLabel>
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
}

export function ShipmentCell({ value }: CellProps<any>) {
  if (!value) {
    return <chakra.div />;
  }
  return (
    <VStack align="start" spacing={0}>
      <Wrap spacing={1}>
        <WrapItem fontWeight="semibold">{value.targetBase.name}, </WrapItem>
        <WrapItem>{value.targetBase.organisation.name}</WrapItem>
      </Wrap>
      <chakra.span style={{ fontSize: "0.8em", color: "gray" }}>
        ID: {value.labelIdentifier}
      </chakra.span>
    </VStack>
  );
}

export function DaysCell({ value }: CellProps<any>) {
  if (value === 1) {
    return <chakra.span>1 day</chakra.span>;
  }
  return <chakra.span>{value} days</chakra.span>;
}

export function QrCodeCell({ value }: CellProps<any>) {
  if (value) {
    return <RiQrCodeLine color="black" size="1.5em" />;
  }
  return <chakra.div />;
}
