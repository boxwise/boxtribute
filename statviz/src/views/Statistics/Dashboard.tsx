import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import BoxView from "./BoxView";
import DemographicView from "./DemographicView";
import TopProductsPieChart from "./components/TopProductsPieChart";

export default function Dashboard() {
  return (
    <div style={{ width: "80%", margin: "25px auto auto auto" }}>
      <Heading>Dashboard</Heading>
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
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <BoxView />
              </GridItem>
              <GridItem>
                <TopProductsPieChart />
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
