import { useState } from "react";
import VisHeader from "../VisHeader";
import { Card, CardBody } from "@chakra-ui/react";
import { getSelectionBackground } from "../../utils/theme";

export default function BoxFlowSankey() {
  return (
    <Card>
      <VisHeader heading="Box Flow" visId="bf" />
      <CardBody>WIP Sankey</CardBody>
    </Card>
  );
}
