import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
    ShipmentByIdQuery,
} from "types/generated/graphql";

interface ShipmentDetailProps {
  shipmentData: ShipmentByIdQuery["shipment"];
}

const ShipmentDetail = ({
  shipmentData,
}: ShipmentDetailProps) => {
  if (shipmentData == null) {
    console.error(
      "Shipment Detail Component: shipmentData is null"
    );
    return <Box>No data found for a shipment with this id</Box>;
  }

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Shipment Details
      </Text>
      <List spacing={2}>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Shipment ID:
          </Text>{" "}
          {shipmentData.id}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Shipment State:
          </Text>{" "}
          {shipmentData.state}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Source Base:
          </Text>{" "}
          {shipmentData.sourceBase?.name}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Target Base:
          </Text>{" "}
          {shipmentData.targetBase?.name}
        </ListItem>
      </List>
      <NavLink to="scan">
        <Button m={2}>Scan boxes for shipment</Button>
      </NavLink>
      <NavLink to="edit">
        <Button m={2}>Edit shipment</Button>
      </NavLink>
    </Box>
  );
};

export default ShipmentDetail;