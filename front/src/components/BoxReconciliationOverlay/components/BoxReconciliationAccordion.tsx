import { Accordion, Alert, Box, Spacer, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { RiQuestionFill } from "react-icons/ri";
import { ILocationData, IProductWithSizeRangeData } from "./BoxReconciliationView";
import { MatchProductsFormData, MatchProductsForm } from "./MatchProductsForm";
import { IReceiveLocationFormData, ReceiveLocationForm } from "./ReceiveLocationForm";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
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
  productId: string | undefined;
  sizeId: string | undefined;
  numberOfItems: number | undefined;
}

export interface ILocationFormData {
  locationId: string | undefined;
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
  const cachedReconciliationMatchProduct = useAtomValue(reconciliationMatchProductAtom);
  const setReconciliationReceiveLocationCache = useSetAtom(reconciliationReceiveLocationAtom);

  // source side
  const sourceProductId = shipmentDetail.sourceProduct?.id;
  const sourceSizeId = shipmentDetail.sourceSize?.id;
  const isSourceProductInCache =
    sourceProductId && !!cachedReconciliationMatchProduct[sourceProductId];

  // target side
  const isTargetProductAutoMatched = !!shipmentDetail?.autoMatchingTargetProduct;
  const targetProductName = isSourceProductInCache
    ? cachedReconciliationMatchProduct[sourceProductId].productId.label
    : isTargetProductAutoMatched && shipmentDetail?.autoMatchingTargetProduct
      ? shipmentDetail.autoMatchingTargetProduct.name
      : undefined;
  const targetProductId = isSourceProductInCache
    ? cachedReconciliationMatchProduct[sourceProductId].productId.value
    : isTargetProductAutoMatched && shipmentDetail?.autoMatchingTargetProduct
      ? shipmentDetail.autoMatchingTargetProduct.id
      : undefined;
  const isSourceSizeInRangeOfTargetProduct = productAndSizesData
    .filter((product) => product.id === targetProductId)
    .every((product) => {
      const possibleSizeIds = product.sizeRange.sizes.map((size) => size.id);
      return sourceSizeId && possibleSizeIds.includes(sourceSizeId);
    });
  const targetSizeName = isSourceProductInCache
    ? cachedReconciliationMatchProduct[sourceProductId].sizeId.label
    : isTargetProductAutoMatched && isSourceSizeInRangeOfTargetProduct && shipmentDetail?.sourceSize
      ? shipmentDetail.sourceSize.label
      : undefined;
  const targetSizeId = isSourceProductInCache
    ? cachedReconciliationMatchProduct[sourceProductId].sizeId.value
    : isTargetProductAutoMatched && isSourceSizeInRangeOfTargetProduct && shipmentDetail?.sourceSize
      ? shipmentDetail.sourceSize.id
      : undefined;

  // form states
  const [productFormData, setProductFormData] = useState<IProductFormData>({
    productId: targetProductId,
    sizeId: targetSizeId,
    numberOfItems: shipmentDetail?.sourceQuantity ?? undefined,
  });
  const [productManuallyMatched, setProductManuallyMatched] = useState(false);
  const [locationSpecified, setLocationSpecified] = useState(false);

  // accordion states
  const isProductAccordionInitiallyNotOpen =
    !isSourceProductInCache && isTargetProductAutoMatched && isSourceSizeInRangeOfTargetProduct;
  const [accordionValue, setAccordionValue] = useState<string[]>(
    isProductAccordionInitiallyNotOpen ? ["receive-location"] : ["match-products"],
  );
  const successfullyMatched = productManuallyMatched || isProductAccordionInitiallyNotOpen;

  return (
    <Accordion.Root
      collapsible
      value={accordionValue}
      onValueChange={(details) => setAccordionValue(details.value)}
    >
      <Accordion.Item value="match-products">
        <Accordion.ItemTrigger
          p={4}
          borderBottomWidth={1}
          onClick={() => setAccordionValue(["match-products"])}
          position="relative"
        >
          <Box
            flex="1"
            textAlign="left"
            fontWeight="bold"
            color={successfullyMatched ? "#659A7E" : "#000"}
          >
            <h2>
              1.{" "}
              {productManuallyMatched
                ? "PRODUCTS DELIVERED"
                : !isSourceProductInCache && isTargetProductAutoMatched
                  ? `PRODUCT AUTO-MATCHED (${shipmentDetail?.sourceQuantity}x)`
                  : "MATCH PRODUCTS"}
            </h2>
          </Box>
          <Box>
            {successfullyMatched ? (
              <BsFillCheckCircleFill color="#659A7E" size={18} />
            ) : (
              <RiQuestionFill size={20} />
            )}
          </Box>
          {isProductAccordionInitiallyNotOpen &&
            !accordionValue.includes("match-products") &&
            !productManuallyMatched && (
              <Text as="i" fontSize="xs" position="absolute" bottom={0.5} left={8}>
                Click here to view auto-matched items
              </Text>
            )}
        </Accordion.ItemTrigger>
        <Accordion.ItemContent p={6} position="relative">
          {!isSourceProductInCache && isTargetProductAutoMatched && !productManuallyMatched && (
            <>
              <Alert.Root status="info" left={0} top={0} position="absolute">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description as="i" fontSize="sm" lineHeight={8}>
                    Items were pre-matched using your enabled ASSORT products. To modify, change the
                    values below.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
              <Spacer height="88px" />
            </>
          )}
          <MatchProductsForm
            defaultValues={
              shipmentDetail?.sourceQuantity
                ? {
                    productId: targetProductName
                      ? { value: targetProductId, label: targetProductName }
                      : undefined,
                    sizeId: targetSizeName
                      ? { value: targetSizeId, label: targetSizeName }
                      : undefined,
                    numberOfItems: shipmentDetail?.sourceQuantity,
                  }
                : undefined
            }
            loading={loading}
            shipmentDetail={shipmentDetail}
            productAndSizesData={productAndSizesData}
            onBoxUndelivered={onBoxUndelivered}
            onSubmitMatchProductsForm={(matchedProductsFormData: MatchProductsFormData) => {
              if (matchedProductsFormData.productId && matchedProductsFormData.sizeId) {
                setProductManuallyMatched(true);
                setAccordionValue(["receive-location"]);

                if (shipmentDetail.sourceProduct?.id) {
                  reconciliationMatchProductCache[shipmentDetail.sourceProduct.id] =
                    matchedProductsFormData;
                  setReconciliationMatchProductCache(reconciliationMatchProductCache);
                }

                setProductFormData({
                  sizeId: matchedProductsFormData.sizeId.value,
                  productId: matchedProductsFormData.productId.value,
                  numberOfItems: matchedProductsFormData.numberOfItems,
                });
              }
            }}
          />
        </Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="receive-location">
        <h2>
          <Accordion.ItemTrigger
            color={!locationSpecified ? "#000" : "#659A7E"}
            p={4}
            borderBottomWidth={1}
            onClick={() => setAccordionValue(["receive-location"])}
          >
            <Box flex="1" textAlign="left" fontWeight="bold">
              2. RECEIVE LOCATION
            </Box>
            {!locationSpecified && <RiQuestionFill size={20} />}
            {locationSpecified && <BsFillCheckCircleFill color="#659A7E" size={18} />}
          </Accordion.ItemTrigger>
        </h2>
        <Accordion.ItemContent p={6}>
          <ReceiveLocationForm
            loading={loading}
            onLocationSpecified={setLocationSpecified}
            allLocations={allLocations}
            onSubmitReceiveLocationForm={(receiveLocationFormData: IReceiveLocationFormData) => {
              if (
                !productFormData.productId ||
                !productFormData.sizeId ||
                !productFormData.numberOfItems
              ) {
                setAccordionValue(["match-products"]);
              } else if (receiveLocationFormData.locationId.value === "") {
                setAccordionValue(["receive-location"]);
              } else {
                setAccordionValue([]);
                setLocationSpecified(true);
                setReconciliationReceiveLocationCache(receiveLocationFormData);
                onBoxDelivered(
                  shipmentDetail.box.labelIdentifier,
                  parseInt(receiveLocationFormData.locationId.value, 10),
                  parseInt(productFormData.productId, 10),
                  parseInt(productFormData.sizeId, 10),
                  productFormData.numberOfItems,
                );
              }
            }}
          />
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
