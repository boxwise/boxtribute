import { useContext, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Alert,
  AlertIcon,
  Button,
  Heading,
  Stack,
  Tab,
  TabIndicator,
  TabList,
  Tabs,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { AddIcon } from "@chakra-ui/icons";
import { compareDesc } from "date-fns";
import { TableSkeleton } from "components/Skeletons";
import { FilteringSortingTable } from "components/Table/Table";
import { SelectColumnFilter } from "components/Table/Filter";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import { BaseOrgCell, BoxesCell, StateCell } from "./components/TableCells";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { ShipmentState } from "queries/types";

// TODO: Revisit this after gql.tada merge
type ShipmentRow =
  | {
      id: string;
      labelIdentifier: string;
      direction: "Sending" | "Receiving";
      partnerBaseOrg: {
        base: string;
        organisation: string;
      };
      state: ShipmentState | null | undefined; // Infer from shipment state
      boxes: number;
      lastUpdated: string;
      href: string;
    }
  | undefined;

function ShipmentsOverviewView() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();
  const { baseId } = useBaseIdParam();
  // If forwarded from AgreementsOverview
  const location = useLocation();
  const currentBaseName = globalPreferences.selectedBase?.name || "";
  const [direction, setDirection] = useState<"Receiving" | "Sending">("Receiving");

  // fetch shipments data
  const { loading, error, data } = useQuery(ALL_SHIPMENTS_QUERY, {
    // returns cache first, but syncs with server in background
    fetchPolicy: "cache-and-network",
  });

  // transform shipments data for UI
  const rowData =
    data?.shipments
      .filter((shipment) => shipment.sourceBase.id === baseId || shipment.targetBase.id === baseId)
      .map((element) => {
        const shipmentRow: ShipmentRow = {
          id: element.id,
          labelIdentifier: element.labelIdentifier,
          direction: "Receiving",
          partnerBaseOrg: {
            base: element.targetBase.name,
            organisation: element.targetBase.organisation.name,
          },
          state: element.state,
          boxes: 0,
          lastUpdated: "",
          href: element.id,
        };

        // Calculating direction.
        // The last part of the labelIdentifier means 2 first letters of Sending base X 2 first letters of Receiving base.
        // Since now we support intra org shipments (shipments between bases of the same organization), this is the most reliable way to tell who's sending or receiving a shipment.
        if (
          shipmentRow.labelIdentifier
            .slice(-5)
            .startsWith(currentBaseName.slice(0, 2).toUpperCase())
        ) {
          shipmentRow.direction = "Sending";
          shipmentRow.partnerBaseOrg = {
            base: element.targetBase.name,
            organisation: element.targetBase.organisation.name,
          };
        } else {
          shipmentRow.direction = "Receiving";
          shipmentRow.partnerBaseOrg = {
            base: element.sourceBase.name,
            organisation: element.sourceBase.organisation.name,
          };
        }

        // counting of boxes from details
        const uniqueBoxIds = element.details.reduce((accumulator, detail) => {
          if (detail.removedOn == null) {
            const boxId = detail.box.labelIdentifier;
            accumulator[boxId] = (accumulator[boxId] || 0) + 1;
          }
          return accumulator;
        }, {});
        shipmentRow.boxes = Object.keys(uniqueBoxIds).length;

        // calculate last updated
        const shipmentUpdateDateTimes = [
          element.startedOn,
          element.sentOn,
          element.receivingStartedOn,
          element.completedOn,
          element.canceledOn,
        ].concat(
          // append all DateTimes in the ShipmentDetails
          element.details
            .reduce(
              (accumulator, detail) =>
                accumulator.concat(detail.createdOn).concat(detail.removedOn || ""),
              [] as string[],
            )
            .filter((date) => Boolean(date)),
        );

        // get max date for last updates
        shipmentRow.lastUpdated = new Intl.DateTimeFormat().format(
          new Date(Math.max(...shipmentUpdateDateTimes.map((date) => new Date(date!).getTime()))),
        );

        return shipmentRow;
      })
      // Default to list by last updated.
      .sort((a, b) => compareDesc(a?.lastUpdated || "", b?.lastUpdated || "")) || [];

  const shipmentFilter = ["Completed", "Canceled", "Lost"];

  const receivingData = rowData.filter((row) => row?.direction === "Receiving");
  const sendingData = rowData.filter((row) => row?.direction === "Sending");

  const receivingCount = receivingData.filter(
    (shipment) => !shipmentFilter.includes(shipment.state!),
  ).length;
  const sendingCount = sendingData.filter(
    (shipment) => !shipmentFilter.includes(shipment.state!),
  ).length;

  // Set default filter if user was forwarded from AgreementsOverview
  const initialState = useMemo(
    () =>
      location.state?.partnerBaseOrg
        ? {
            filters: [{ id: "partnerBaseOrg", value: [location.state.partnerBaseOrg] }],
          }
        : {},
    [location],
  );

  // Define columns
  const columns = useMemo(
    () => [
      {
        Header: "Shipment ID",
        accessor: "labelIdentifier",
        disableFilters: true,
      },
      {
        Header: "Base",
        accessor: "partnerBaseOrg",
        Cell: BaseOrgCell,
        Filter: SelectColumnFilter,
        filter: "includesSomeObject",
      },
      {
        Header: "Status",
        accessor: "state",
        Cell: StateCell,
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Last Updated",
        accessor: "lastUpdated",
        disableFilters: true,
      },
      {
        Header: "Contains",
        accessor: "boxes",
        Cell: BoxesCell,
        disableFilters: true,
      },
    ],
    [],
  );

  // error and loading handling
  let shipmentsTable: JSX.Element;
  if (error) {
    shipmentsTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading || isGlobalStateLoading) {
    shipmentsTable = <TableSkeleton />;
  } else {
    shipmentsTable = (
      <FilteringSortingTable
        columns={columns}
        tableData={direction === "Receiving" ? receivingData : sendingData}
        initialState={initialState}
      />
    );
  }

  return (
    <>
      <BreadcrumbNavigation
        items={[
          { label: "Aid Transfers", linkPath: "../../transfers/agreements", relative: "path" },
          { label: "Manage Shipments" },
        ]}
      />
      <Heading fontWeight="bold" mb={4} as="h2">
        Manage Shipments
      </Heading>
      <Stack direction="row" my={4} spacing={4}>
        <Link to="create">
          <Button leftIcon={<AddIcon />} borderRadius="0">
            Create Shipment
          </Button>
        </Link>
      </Stack>
      <Tabs
        variant="enclosed-colored"
        onChange={() => setDirection((prev) => (prev === "Sending" ? "Receiving" : "Sending"))}
      >
        <TabList borderTop="none" borderBottom="none">
          <Tab
            flex={1}
            color={direction === "Receiving" ? "blue.500" : "inherit"}
            fontWeight={direction === "Receiving" ? "bold" : "inherit"}
          >
            <ReceivingIcon mr={2} /> {`Receiving (${receivingCount})`}
          </Tab>
          <Tab
            flex={1}
            color={direction === "Sending" ? "blue.500" : "inherit"}
            fontWeight={direction === "Sending" ? "bold" : "inherit"}
          >
            <SendingIcon mr={2} /> {`Sending (${sendingCount})`}
          </Tab>
        </TabList>
        <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
      </Tabs>
      <br />
      {shipmentsTable}
    </>
  );
}

export default ShipmentsOverviewView;
