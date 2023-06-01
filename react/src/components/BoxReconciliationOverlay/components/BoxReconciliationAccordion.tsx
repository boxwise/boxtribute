import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box } from "@chakra-ui/react";
import { useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { RiQuestionFill } from "react-icons/ri";
import { ShipmentDetail } from "types/generated/graphql";
import { ILocationData, IProductWithSizeRangeData } from "../BoxReconciliationContainer";
import { MatchProductsForm } from "./MatchProductsForm";
import { ReceiveLocationForm } from "./ReceiveLocationForm";

interface IBoxReconcilationAccordionProps {
  shipmentDetail: ShipmentDetail | undefined;
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
}

export function BoxReconcilationAccordion({
  shipmentDetail,
  productAndSizesData,
  allLocations,
}: IBoxReconcilationAccordionProps) {
  const [accordionIndex, setAccordionIndex] = useState(-1);
  const [productMatched, setProductMatched] = useState<boolean>(false);
  const [locationSpecified, setLocationSpecified] = useState<boolean>(false);

  return (
    <Accordion allowToggle index={accordionIndex}>
      <AccordionItem>
        <h2>
          <AccordionButton
            p={4}
            borderBottomWidth={1}
            onClick={() => setAccordionIndex(0)}
            color={!productMatched ? "#000" : "#659A7E"}
          >
            <Box flex="1" textAlign="left" fontWeight="bold">
              1. {!productMatched && "MATCH PRODUCTS"}
              {productMatched && "PRODUCTS DELIVERED"}
            </Box>
            {!productMatched && <RiQuestionFill size={20} />}
            {productMatched && <BsFillCheckCircleFill color="#659A7E" size={18} />}
          </AccordionButton>
        </h2>
        <AccordionPanel p={6}>
          <MatchProductsForm
            shipmentDetail={shipmentDetail}
            productAndSizesData={productAndSizesData}
            onSubmitMatchProductsForm={() => {
              setProductMatched(true);
              setAccordionIndex(1);
            }}
          />
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton
            color={!locationSpecified ? "#000" : "#659A7E"}
            p={4}
            borderBottomWidth={1}
            onClick={() => setAccordionIndex(1)}
          >
            <Box flex="1" textAlign="left" fontWeight="bold">
              2. RECEIVE LOCATION
            </Box>
            {!locationSpecified && <RiQuestionFill size={20} />}
            {locationSpecified && <BsFillCheckCircleFill color="#659A7E" size={18} />}
          </AccordionButton>
        </h2>
        <AccordionPanel p={6}>
          <ReceiveLocationForm
            onLocationSpecified={setLocationSpecified}
            allLocations={allLocations}
            onSubmitReceiveLocationForm={() => {
              setLocationSpecified(true);
              setAccordionIndex(-1);
            }}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
