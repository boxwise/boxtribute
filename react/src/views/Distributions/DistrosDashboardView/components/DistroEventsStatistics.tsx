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
  Button,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { ReactNode } from "react";
import { useGetUrlForResourceHelpers } from "utils/hooks";
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

const downloadCsvExport = (baseId: string) => {
  const rows = [
    ["productId", "Category", "Product Name", "Gender", "sizeId", "Size Name", "Number of Items on Distro", "Number of Items Returned", "Actually distributed number of items", "Earliest possible distro date", "Latest possible distro date", "Potentially involved Distro Spots"],
    ["1", "T-Shirts", "Dummy T-Shirt 1", "Unisex", "99", "Dummy Size XL", "123", "23", "100", "2022-08-02", "2022-08-28", "Horgos River; LIDL"],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

  const dateStr = format(new Date(), 'MM-dd-yyyy-HH-mm-ss');
  const filename = `boxtribute_base_${baseId}_distributions_export_${dateStr}.csv`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);

  link.click();
};

const DistroEventsStatistics = () => {
  const { getBaseId } = useGetUrlForResourceHelpers();
  return (
    <VStack>
      <Button my={7} onClick={() => downloadCsvExport(getBaseId())}>
        Download Data
      </Button>
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
    </VStack>
  );
};

export default DistroEventsStatistics;
