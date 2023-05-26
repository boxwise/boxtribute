import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box } from "@chakra-ui/react";
import { RiQuestionFill } from "react-icons/ri";
import { ShipmentDetail } from "types/generated/graphql";
import { IProductWithSizeRangeData } from "../BoxReconciliationContainer";
import { MatchProductsForm } from "./MatchProductsForm";

interface IBoxReconcilationAccordionProps {
  shipmentDetail: ShipmentDetail | undefined;
  productAndSizesData: IProductWithSizeRangeData[];
  // allLocations: ILocationData[];
}

export function BoxReconcilationAccordion({
  shipmentDetail,
  productAndSizesData,
}: // allLocations,
IBoxReconcilationAccordionProps) {
  return (
    <Accordion defaultIndex={[0]}>
      <AccordionItem>
        <h2>
          <AccordionButton p={4} borderBottomWidth={1}>
            <Box flex="1" textAlign="left" fontWeight="bold">
              1. MATCH PRODUCTS
            </Box>
            <RiQuestionFill size={20} />
          </AccordionButton>
        </h2>
        <AccordionPanel p={6}>
          <MatchProductsForm
            shipmentDetail={shipmentDetail}
            productAndSizesData={productAndSizesData}
            onSubmitMatchProductsForm={() => {}}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton p={4} borderBottomWidth={1}>
            <Box flex="1" textAlign="left" fontWeight="bold">
              2. RECEIVE LOCATION
            </Box>
            <RiQuestionFill size={20} />
          </AccordionButton>
        </h2>
        <AccordionPanel />
      </AccordionItem>
    </Accordion>
  );
}
