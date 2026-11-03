import { CellProps } from "react-table";
import { Tag, TagLabel, Wrap, WrapItem, chakra } from "@chakra-ui/react";
import { Style } from "victory";
import { RiQrCodeLine } from "react-icons/ri";

import { colorIsBright } from "utils/helpers";

export function StateCell({ value }: CellProps<any>) {
  let color = "inherit";
  const name = value;

  if (
    name === "MarkedForShipment" ||
    name === "InTransit" ||
    name === "Receiving" ||
    name === "Donated"
  ) {
    color = "blue.700";
  } else if (name === "InStock") {
    color = "green.700";
  } else if (name === "Scrap" || name === "Lost" || name === "NotDelivered") {
    color = "red.700";
  }

  return (
    <chakra.span as="b" color={color}>
      {name}
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
