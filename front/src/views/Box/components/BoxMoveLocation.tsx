import { List, Text, Flex, WrapItem, Button, SkeletonText } from "@chakra-ui/react";
import { Box } from "types/query-types";

export interface IBoxMoveLocationProps {
  boxData: Box;
  boxInTransit: boolean;
  isLoading: boolean;
  onMoveToLocationClick: (locationId: string) => void;
}

function BoxMoveLocation({
  boxData,
  boxInTransit,
  onMoveToLocationClick,
  isLoading,
}: IBoxMoveLocationProps) {
  return (
    <>
      {isLoading && (
        <SkeletonText
          width="100%"
          height="20px"
          textAlign="center"
          fontSize="xl"
          mb={4}
          noOfLines={1}
        />
      )}
      {!isLoading && boxData?.state !== "MarkedForShipment" && (
        <Text data-testid="box-location-label" textAlign="center" fontSize="xl" mb={4}>
          Move this box from <strong>{boxData?.location?.name}</strong> to:
        </Text>
      )}
      <List>
        <Flex wrap="wrap" justifyContent="center">
          {boxData?.location?.base?.locations
            ?.filter((location) => location.id !== boxData?.location?.id)
            .filter(
              (location) =>
                location?.defaultBoxState !== "Lost" && location?.defaultBoxState !== "Scrap",
            )
            .sort((a, b) => Number(a?.seq) - Number(b?.seq))
            .map((location) => (
              <WrapItem key={location.id} m={1}>
                <Button
                  data-testid={`location-${location.name?.replace(/\s+/g, "_").toLowerCase()}-btn`}
                  borderRadius="0px"
                  isLoading={isLoading}
                  onClick={() => onMoveToLocationClick(location.id)}
                  isDisabled={
                    boxData.location?.__typename === "ClassicLocation" &&
                    boxData.location?.defaultBoxState !== "Lost" &&
                    boxData.location?.__typename === "ClassicLocation" &&
                    boxData.location?.defaultBoxState !== "Scrap"
                      ? "Lost" === boxData.state ||
                        "Scrap" === boxData.state ||
                        "NotDelivered" === boxData.state ||
                        boxInTransit
                      : false
                  }
                  border="2px"
                >
                  {location.name}
                  {location.defaultBoxState !== "InStock" && (
                    <>
                      {" "}
                      - Boxes are&nbsp;<i> {location.defaultBoxState}</i>
                    </>
                  )}
                </Button>
              </WrapItem>
            ))}
        </Flex>
      </List>
    </>
  );
}

export default BoxMoveLocation;
