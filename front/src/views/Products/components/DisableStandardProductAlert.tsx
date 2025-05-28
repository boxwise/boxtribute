import { Text } from "@chakra-ui/react";

function DisableStandardProductAlert({
  productName,
  instockItemsCount,
  transferItemsCount,
}: {
  productName: string;
  instockItemsCount: string;
  transferItemsCount: string;
}) {
  return (
    <>
      You are attempting to disable the product {productName} with {instockItemsCount}{" "}
      <Text fontWeight="600" color="#659A7E" display="inline">
        InStock
      </Text>
      {!!transferItemsCount && (
        <>
          , and with {transferItemsCount}{" "}
          <Text fontWeight="600" color="#659A7E" display="inline">
            MarkedForShipment
          </Text>
          ,{" "}
          <Text fontWeight="600" color="#659A7E" display="inline">
            InTransit
          </Text>
          , or{" "}
          <Text fontWeight="600" color="#659A7E" display="inline">
            Receiving
          </Text>
        </>
      )}{" "}
      items in one or more locations.To continue, you must first reclassify all{" "}
      <Text fontWeight="600" color="#659A7E" display="inline">
        InStock
      </Text>{" "}
      boxes as a different product{!!transferItemsCount && " and complete your shipments"}.
    </>
  );
}

export default DisableStandardProductAlert;
