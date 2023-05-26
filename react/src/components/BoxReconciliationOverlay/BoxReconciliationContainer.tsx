import { ShipmentDetail } from "types/generated/graphql";

import { BoxReconcilationAccordion } from "./components/BoxReconciliationAccordion";

interface IBoxReconciliationContainerProps {
  shipmentDetail: ShipmentDetail | undefined;
}

export function BoxReconciliationContainer({ shipmentDetail }: IBoxReconciliationContainerProps) {
  return <BoxReconcilationAccordion shipmentDetail={shipmentDetail} />;
}
