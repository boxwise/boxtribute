import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Select,
  SimpleGrid,
  background,
} from "@chakra-ui/react";
import DemographicView from "./DemographicView";
import TopProductsPieChart from "./components/TopProducts";
import CreatedBoxesBarChart from "./components/CreatedBoxes";
import TimeRangeSelect from "./components/filter/TimeRangeSelect";

export default function Dashboard() {
  const onTimeRangeChange = (from: Date, to: Date) => {
    console.log("Time range changed:", from, to);
  };

  return (
    <div style={{ width: "80%", margin: "25px auto auto auto" }}>
      <Heading
        borderBottom="1px"
        borderColor="gray.200"
        style={{ marginBottom: "25px" }}
      >
        Dashboard
      </Heading>

      <HStack spacing="10px" style={{ padding: "20px" }} shadow="md">
        <Box width="400px">
          <TimeRangeSelect onChange={onTimeRangeChange} />
        </Box>
        <Box width="250px">
          <FormLabel>Label</FormLabel>
          <Select>
            <option>option1</option>
            <option>option2</option>
          </Select>
        </Box>
        <Box width="250px">
          <FormLabel>Label</FormLabel>
          <Select>
            <option>option1</option>
            <option>option2</option>
          </Select>
        </Box>
      </HStack>

      <Accordion
        defaultIndex={[0, 1]}
        allowMultiple
        style={{ marginTop: "10px" }}
      >
        <AccordionItem>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Products And Boxes
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Grid>
              <GridItem>
                <FormLabel htmlFor="box-item-select">Display by</FormLabel>
                <Select name="box-item-select">
                  <option value="boxes">Boxes</option>
                  <option value="items">Items</option>
                </Select>
              </GridItem>
            </Grid>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <CreatedBoxesBarChart width="750px" height="500px" />
              </GridItem>
              <GridItem>
                <TopProductsPieChart width="600px" height="400px" />
              </GridItem>
              <GridItem>
                <Heading size="md" style={{ marginBottom: "50px" }}>
                  (WIP) Sankey Product Flow
                </Heading>
              </GridItem>
            </Grid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Demographics
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <DemographicView />
              </GridItem>
            </Grid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
