import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  VStack,
  List,
  ListItem,
  Text,
  Button,
} from "@chakra-ui/react";
import { DistroEventStateLabel } from "views/Distributions/DistroSpotsView/components/DistroSpots";

interface DistroEventPackingProps {
  distroEventData: DistroEvent;
}

const DistroEventPacking = ({ distroEventData }: DistroEventPackingProps) => {
  return (
    <VStack>
      <Text fontSize="xl" mb={2}>
        Distro Event
      </Text>
      <Text>
        <strong>{distroEventData.eventDate?.toDateString()}</strong>
      </Text>
      <Text>
        <strong>{DistroEventStateLabel.get(distroEventData.status)}</strong>
      </Text>
      <Accordion w={[300, 420, 500]} allowToggle mb={4}>
          {distroEventData.itemsForPacking.map((item) => {
            return (
              <AccordionItem>
                <AccordionButton>
                  <AccordionIcon />
                  <Text>{item.productName}</Text>
                </AccordionButton>
                <AccordionPanel>
                  <List>
                    <ListItem>
                      <Text>{item.productName}</Text>
                    </ListItem>
                    <ListItem>
                      <Text>{item.size}</Text>
                    </ListItem>
                    <ListItem>
                      <Text>{item.items}</Text>
                    </ListItem>
                  </List>
                  <Button
                    onClick={() => {}}
                    variantColor="blue"
                    variant="outline"
                    size="sm"
                    mr={2}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {}}
                    variantColor="red"
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </AccordionPanel>
              </AccordionItem>
            );
          }, [])}
        
        </Accordion>
    </VStack>
  );
};

export default DistroEventPacking;
{/* 
<Accordion w={[300, 420, 500]} allowToggle mb={4}>
      {distroSpots.map((distroSpot) => {
        return (
          <AccordionItem>
            <h2>
              <AccordionButton>
                <VStack flex="1" textAlign="left">
                  <Box fontWeight="bold">{distroSpot.name}</Box>
                  {distroSpot.nextDistroEventDate ? (
                    <Box>
                      Next distribution on:{" "}
                      {distroSpot.nextDistroEventDate?.toDateString()}{" "}
                    </Box>
                  ) : null}
                </VStack>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {distroSpot.comment ? (
                <Box my={2}>
                  <strong>Comment:</strong> {distroSpot.comment}
                </Box>
              ) : null}
              {distroSpot.distroEvents?.length > 0 ? (
                <Text>
                  <strong>Distibution Events: </strong>
                </Text>
              ) : (
                <Text>No Distribution Events</Text>
              )}

              <List>
                {distroSpot.distroEvents.map((distroEvent, i) => {
                  return (
                    <>
                      <ListItem
                        border="1px"
                        p={2}
                        my={2}
                        key={i}
                        cursor="pointer"
                        _hover={{
                          color: "teal.500",
                        }}
                        onClick={() => onDistroEventClick(distroEvent.id)}
                      >
                        <Box>Date: {distroEvent.date?.toDateString()}</Box>
                        <Box>
                          Status:{" "}
                          {DistroEventStateLabel.get(distroEvent.state)}
                        </Box>
                      </ListItem>
                    </>
                  );
                })}
              </List>
              <Button onClick={() => onCreateNewDistroEventClick()}>Create New Event</Button>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion> */}
