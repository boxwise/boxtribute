import { gql } from "@apollo/client";
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
import {
  DownloadDistributionEventsStatisticsQuery,
  DownloadDistributionEventsStatisticsQueryVariables,
} from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "hooks/hooks";
import { VictoryPie } from "victory";
import { useApolloClient } from "@apollo/client";

export const DOWNLOAD_STATIC_DATA = gql`
  query DownloadDistributionEventsStatistics($baseId: ID!) {
    base(id: $baseId) {
      id
      distributionEventsStatistics {
        productName
        sizeLabel
        genderLabel
        categoryLabel
        inflow
        outflow
        earliestPossibleDistroDate
        latestPossibleDistroDate
        potentiallyInvolvedDistributionSpots
        involvedDistributionEventIds
        distroEventTrackingGroupId
        productId
        sizeId
      }
    }
  }
`;

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
  const apolloClient = useApolloClient();
  const { getBaseId } = useGetUrlForResourceHelpers();

  const exportCsvColumns = [
    "productName",
    "sizeLabel",
    "genderLabel",
    "categoryLabel",
    "outflow",
    "inflow",
    "earliestPossibleDistroDate",
    "latestPossibleDistroDate",
    "potentiallyInvolvedDistributionSpots",
    "involvedDistributionEventIds",
    "distroEventTrackingGroupId",
    "productId",
    "sizeId",
  ];

  const downloadCsvExport = (baseId: string) => {
    apolloClient
      .query<
        DownloadDistributionEventsStatisticsQuery,
        DownloadDistributionEventsStatisticsQueryVariables
      >({ query: DOWNLOAD_STATIC_DATA, variables: { baseId } })
      .then((result) => {
        const csvContent =
          "data:text/csv;charset=utf-8," +
          exportCsvColumns.join(",") + "\n" +
          result.data.base?.distributionEventsStatistics
            .map((e) =>
              exportCsvColumns.map((c) => e[c]).join(",")
            )
            .join("\n");

        const dateStr = format(new Date(), "MM-dd-yyyy-HH-mm-ss");
        const filename = `boxtribute_base_${baseId}_distributions_export_${dateStr}.csv`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);

        link.click();
      });
  };

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
