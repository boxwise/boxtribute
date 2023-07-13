import { List, Text, Flex, WrapItem, Button, SkeletonText } from "@chakra-ui/react";
import { BoxState, ClassicLocation } from "types/generated/graphql";

export interface IBoxMoveLocationProps {
  boxData: any;
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
      {!isLoading && (
        <Text data-testid="box-location-label" textAlign="center" fontSize="xl" mb={4}>
          Move this box from <strong>{boxData.location?.name}</strong> to:
        </Text>
      )}
      <List>
        <Flex wrap="wrap" justifyContent="center">
          {boxData.location?.base?.locations
            ?.filter((location) => location.id !== boxData.location?.id)
            .filter(
              (location) =>
                location?.defaultBoxState !== BoxState.Lost &&
                location?.defaultBoxState !== BoxState.Scrap,
            )
            .sort((a, b) => Number(a?.seq) - Number(b?.seq))
            .map((location) => (
              <WrapItem key={location.id} m={1}>
                <Button
                  data-testid={`location-${location.name?.replace(/\s+/g, "_").toLowerCase()}-btn`}
                  borderRadius="0px"
                  isLoading={isLoading}
                  onClick={() => onMoveToLocationClick(location.id)}
                  disabled={
                    (boxData.location as ClassicLocation).defaultBoxState !== BoxState.Lost &&
                    (boxData.location as ClassicLocation).defaultBoxState !== BoxState.Scrap
                      ? BoxState.Lost === boxData.state ||
                        BoxState.Scrap === boxData.state ||
                        boxInTransit
                      : false
                  }
                  border="2px"
                >
                  {location.name}
                  {location.defaultBoxState !== BoxState.InStock && (
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
