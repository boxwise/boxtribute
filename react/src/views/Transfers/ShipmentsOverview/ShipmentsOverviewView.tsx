/* eslint-disable indent */
import { useContext, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Alert, AlertIcon, Button, Heading, Stack } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import { ShipmentsQuery } from "types/generated/graphql";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { FilteringSortingTable } from "components/Table/Table";
import { SelectColumnFilter } from "components/Table/Filter";
import { BaseOrgCell, BoxesCell, DirectionCell, StateCell } from "./components/TableCells";

function ShipmentsOverviewView() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  // If forwarded from AgreementsOverview
  const location = useLocation();

  // fetch shipments data
  const { loading, error, data } = useQuery<ShipmentsQuery>(ALL_SHIPMENTS_QUERY);

  // transform shipments data for UI
  const graphqlToTableTransformer = (shipmentQueryResult: ShipmentsQuery | undefined) =>
    shipmentQueryResult?.shipments.map((element) => {
      if (globalPreferences?.availableBases) {
        const availableBaseIds = globalPreferences.availableBases.map((base) =>
          parseInt(base.id, 10),
        );
        const sourceBaseId = parseInt(element.sourceBase.id, 10);
        const targetBaseId = parseInt(element.targetBase.id, 10);

        const shipmentRow = {
          id: element.id,
          direction: "To",
          partnerBaseOrg: {
            base: element.targetBase.name,
            organisation: element.targetBase.organisation.name,
          },
          state: element.state,
          boxes: 0,
          lastUpdated: "",
          href: element.id,
        };

        // calculating direction
        if (availableBaseIds.includes(sourceBaseId)) {
          shipmentRow.direction = "To";
          shipmentRow.partnerBaseOrg = {
            base: element.targetBase.name,
            organisation: element.targetBase.organisation.name,
          };
        } else if (availableBaseIds.includes(targetBaseId)) {
          shipmentRow.direction = "From";
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
                accumulator.concat(detail.createdOn).concat(detail.removedOn),
              [],
            )
            .filter((date) => Boolean(date)),
        );

        // get max date for last updates
        shipmentRow.lastUpdated = new Intl.DateTimeFormat().format(
          new Date(Math.max(...shipmentUpdateDateTimes.map((date) => new Date(date).getTime()))),
        );

        return shipmentRow;
      }
      return undefined;
    }) || [];

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
        Header: "",
        accessor: "direction",
        Cell: DirectionCell,
        Filter: SelectColumnFilter,
        filter: "includesSome",
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
        Header: "Contains",
        accessor: "boxes",
        Cell: BoxesCell,
        disableFilters: true,
      },
      {
        Header: "Last Updated",
        accessor: "lastUpdated",
        disableFilters: true,
      },
    ],
    [],
  );

  // error and loading handling
  let shipmentsTable;
  if (error) {
    shipmentsTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading) {
    shipmentsTable = <TableSkeleton />;
  } else {
    shipmentsTable = (
      <FilteringSortingTable
        columns={columns}
        tableData={graphqlToTableTransformer(data)}
        initialState={initialState}
      />
    );
  }

  return (
    <>
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
      {shipmentsTable}
    </>
  );
}

export default ShipmentsOverviewView;
