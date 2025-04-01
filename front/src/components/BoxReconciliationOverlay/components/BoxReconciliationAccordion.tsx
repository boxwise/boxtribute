import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { RiQuestionFill } from "react-icons/ri";
import { ILocationData, IProductWithSizeRangeData } from "./BoxReconciliationView";
import { MatchProductsFormData, MatchProductsForm } from "./MatchProductsForm";
import { IReceiveLocationFormData, ReceiveLocationForm } from "./ReceiveLocationForm";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  hasReconciliationMatchProductAtomCached,
  reconciliationMatchProductAtom,
  reconciliationReceiveLocationAtom,
} from "stores/globalCacheStore";
import { ShipmentDetailWithAutomatchProduct } from "queries/types";

interface IBoxReconcilationAccordionProps {
  shipmentDetail: ShipmentDetailWithAutomatchProduct;
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  loading: boolean;
  onBoxUndelivered: (labelIdentifier: string) => void;
  onBoxDelivered: (
    labelIdentifier: string,
    locationId: number,
    productId: number,
    sizeId: number,
    numberOfItems: number,
  ) => void;
}

export interface IProductFormData {
  productId: number | undefined;
  sizeId: number | undefined;
  numberOfItems: number | undefined;
}

export interface ILocationFormData {
  locationId: number | undefined;
}

export function BoxReconcilationAccordion({
  shipmentDetail,
  productAndSizesData,
  allLocations,
  loading,
  onBoxUndelivered,
  onBoxDelivered,
}: IBoxReconcilationAccordionProps) {
  const [reconciliationMatchProductCache, setReconciliationMatchProductCache] = useAtom(
    reconciliationMatchProductAtom,
  );
  const hasProductCache = useAtomValue(hasReconciliationMatchProductAtomCached);
  const isProductAutoMatched = !!shipmentDetail?.autoMatchingTargetProduct;
  const [accordionIndex, setAccordionIndex] = useState(
    hasProductCache ? 0 : isProductAutoMatched ? 1 : 0,
  );
  const [productManuallyMatched, setProductManuallyMatched] = useState(false);
  const [locationSpecified, setLocationSpecified] = useState(false);
  const [productFormData, setProductFormData] = useState<IProductFormData>({
    productId: isProductAutoMatched
      ? parseInt(shipmentDetail.autoMatchingTargetProduct?.id ?? "0")
      : undefined,
    sizeId: isProductAutoMatched ? parseInt(shipmentDetail.sourceSize?.id ?? "0") : undefined,
    numberOfItems: shipmentDetail?.sourceQuantity ?? undefined,
  });
  const setReconciliationReceiveLocationCache = useSetAtom(reconciliationReceiveLocationAtom);
  const accordionHeaderColor = isProductAutoMatched || productManuallyMatched ? "#659A7E" : "#000";
  const accordionHeaderText = productManuallyMatched
    ? "PRODUCTS DELIVERED"
    : isProductAutoMatched
      ? `PRODUCT AUTO-MATCHED (${shipmentDetail?.sourceQuantity}x)`
      : "MATCH PRODUCTS";

  return (
    <Accordion allowToggle index={accordionIndex}>
      <AccordionItem>
        <AccordionButton
          p={4}
          borderBottomWidth={1}
          onClick={() => setAccordionIndex(0)}
          position="relative"
        >
          <Box flex="1" textAlign="left" fontWeight="bold" color={accordionHeaderColor}>
            <h2>1. {accordionHeaderText}</h2>
          </Box>
          <Box>
            {!(productManuallyMatched || isProductAutoMatched) && <RiQuestionFill size={20} />}
            {(productManuallyMatched || isProductAutoMatched) && (
              <BsFillCheckCircleFill color="#659A7E" size={18} />
            )}
          </Box>
          {isProductAutoMatched && accordionIndex !== 0 && !productManuallyMatched && (
            <Text as="i" fontSize="xs" position="absolute" bottom={0.5} left={8}>
              Click here to view auto-matched items
            </Text>
          )}
        </AccordionButton>
        <AccordionPanel p={6} position="relative">
          {isProductAutoMatched && !productManuallyMatched && (
            <>
              <Alert status="info" left={0} top={0} position="absolute">
                <AlertIcon />
                <Text as="i" fontSize="sm" lineHeight={8}>
                  Items were pre-matched using your enabled ASSORT products. To modify, change the
                  values below.
                </Text>
              </Alert>
              <Spacer height="88px" />
            </>
          )}
          <MatchProductsForm
            loading={loading}
            shipmentDetail={shipmentDetail}
            productAndSizesData={productAndSizesData}
            onBoxUndelivered={onBoxUndelivered}
            onSubmitMatchProductsForm={(matchedProductsFormData: MatchProductsFormData) => {
              setProductManuallyMatched(true);
              setAccordionIndex(1);

              if (shipmentDetail.sourceProduct?.id) {
                reconciliationMatchProductCache[shipmentDetail.sourceProduct.id] =
                  matchedProductsFormData;
                setReconciliationMatchProductCache(reconciliationMatchProductCache);
              }

              setProductFormData({
                sizeId: parseInt(matchedProductsFormData.sizeId.value, 10),
                productId: parseInt(matchedProductsFormData.productId.value, 10),
                numberOfItems: matchedProductsFormData.numberOfItems,
              });
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
            loading={loading}
            onLocationSpecified={setLocationSpecified}
            allLocations={allLocations}
            onSubmitReceiveLocationForm={(receiveLocationFormData: IReceiveLocationFormData) => {
              setLocationSpecified(true);
              setAccordionIndex(-1);
              setReconciliationReceiveLocationCache(receiveLocationFormData);

              onBoxDelivered(
                shipmentDetail.box.labelIdentifier,
                parseInt(receiveLocationFormData.locationId.value, 10),
                productFormData.productId!,
                productFormData.sizeId!,
                productFormData.numberOfItems!,
              );
            }}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
