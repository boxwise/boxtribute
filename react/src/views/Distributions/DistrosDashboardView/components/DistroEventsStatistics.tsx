import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Box,
  Wrap,
  WrapItem,
  Heading,
} from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { VictoryPie } from "victory";

const Card = ({ children }: { children: ReactNode[] | ReactNode }) => (
  <Box
    role={"group"}
    p={6}
    maxW={"330px"}
    w={"full"}
    bg={"white"}
    boxShadow={"2xl"}
    rounded={"lg"}
    pos={"relative"}
    zIndex={1}
  >
    {children}
  </Box>
);

const CardWithTwoElements = ({
  topElement,
  bottomElement,
}: {
  topElement: ReactNode;
  bottomElement: ReactNode;
}) => (
  <Card>
    <Box
      rounded={"lg"}
      mt={-12}
      pos={"relative"}
      height={"230px"}
      _after={{
        transition: "all .3s ease",
        content: '""',
        w: "full",
        h: "full",
        pos: "absolute",
        top: 5,
        left: 0,
        filter: "blur(15px)",
        zIndex: -1,
      }}
      _groupHover={{
        _after: {
          filter: "blur(20px)",
        },
      }}
    >
      {topElement}
    </Box>
    {bottomElement}
  </Card>
);

const DistroEventsStatistics = () => {
  return (
    <Wrap spacing="8">
      <WrapItem>
        <CardWithTwoElements
          topElement={<VictoryPie />}
          bottomElement={<Heading size="md">Product Breakdown</Heading>}
        />
      </WrapItem>
      <WrapItem>
        <CardWithTwoElements
          topElement={<VictoryPie />}
          bottomElement={<Heading size="md">Product Breakdown</Heading>}
        />
      </WrapItem>
      <WrapItem>
        <Card>
          <Stat>
            <StatLabel>Total distributed items</StatLabel>
            <StatNumber>2855</StatNumber>
            <StatHelpText>Feb 12 - Feb 28 2022</StatHelpText>
            <StatHelpText>
              <StatArrow type="decrease" />
              9.05% (compared to previous date range)
            </StatHelpText>
          </Stat>
        </Card>
      </WrapItem>
      <WrapItem>
        <CardWithTwoElements
          topElement={<VictoryPie />}
          bottomElement={<Heading size="md">Product Breakdown</Heading>}
        />
      </WrapItem>
    </Wrap>
  );
};

export default DistroEventsStatistics;
