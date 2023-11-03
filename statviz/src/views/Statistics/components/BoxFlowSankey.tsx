import { useState } from "react";
import VisHeader from "./VisHeader";
import { Card, CardBody } from "@chakra-ui/react";
import { getSelectionBackground } from "../../../utils/theme";

export default function BoxFlowSankey() {
  const [selected, setSelected] = useState<boolean>(false);

  return (
    <Card backgroundColor={getSelectionBackground(selected)}>
      <VisHeader
        heading="Box Flow"
        visId="bf"
        onSelect={() => setSelected(true)}
        onDeselect={() => setSelected(false)}
      />
      <CardBody>WIP Sankey</CardBody>
    </Card>
  );
}
