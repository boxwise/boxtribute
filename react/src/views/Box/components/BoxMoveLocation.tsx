import { List, Text, Flex, WrapItem, Button } from "@chakra-ui/react";
import { BoxState, ClassicLocation } from "types/generated/graphql";

export interface IBoxMoveLocationProps {
  boxData: any;
  onMoveToLocationClick: (locationId: string) => void;
}

function BoxMoveLocation({ boxData, onMoveToLocationClick }: IBoxMoveLocationProps) {
  return (
    <>
      <Text data-testid="box-location-label" textAlign="center" fontSize="xl" mb={4}>
        Move this box from <strong>{boxData.location?.name}</strong> to:
      </Text>
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
                  onClick={() => onMoveToLocationClick(location.id)}
                  disabled={
                    (boxData.location as ClassicLocation).defaultBoxState !== BoxState.Lost &&
                    (boxData.location as ClassicLocation).defaultBoxState !== BoxState.Scrap
                      ? BoxState.Lost === boxData.state || BoxState.Scrap === boxData.state
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
