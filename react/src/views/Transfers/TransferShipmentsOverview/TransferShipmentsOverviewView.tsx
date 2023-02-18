import { useContext, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Button, Heading, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { ShipmentsQuery } from "types/generated/graphql";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { SelectColumnFilter } from "components/Table/Filter";
import ShipmentsTable from "./components/ShipmentsTable";
import { BaseOrgCell, BoxesCell, DirectionCell, StateCell } from "./components/TableCells";

export const ALL_SHIPMENTS_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query Shipments {
    shipments {
      ...ShipmentFields
    }
  }
`;

function TransferShipmentOverviewView() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  // fetch shipments data
  const { loading, error, data } = useQuery<ShipmentsQuery>(ALL_SHIPMENTS_QUERY);

  // transform shipments data for UI
  const graphqlToTableTransformer = (shipmentQueryResult: ShipmentsQuery | undefined) =>
    shipmentQueryResult?.shipments.map((element) => {
      if (globalPreferences?.availableBases && element?.sourceBase && element?.targetBase) {
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
        const notDeletedDetails = element.details.filter((detail) => !detail.deletedOn);
        const uniqueBoxIds = notDeletedDetails.reduce((accumulator, detail) => {
          const boxId = detail.box.labelIdentifier;
          accumulator[boxId] = (accumulator[boxId] || 0) + 1;
          return accumulator;
        }, {});
        shipmentRow.boxes = Object.keys(uniqueBoxIds).length;

        // calculate last updated
        const shipmentUpdateDateTimes = [
          element.startedOn,
          element.sentOn,
          element.completedOn,
          element.canceledOn,
        ].concat(
          // append all DateTimes in the ShipmentDetails
          element.details
            .map((detail) => [detail.createdOn, detail.deletedOn])
            .filter((dates) => dates.every((date) => Boolean(date)))
            .flat(),
        );
        // get max date for last updates
        shipmentRow.lastUpdated = new Intl.DateTimeFormat().format(
          new Date(Math.max(...shipmentUpdateDateTimes.map((date) => new Date(date).getTime()))),
        );

        return shipmentRow;
      }
      return undefined;
    }) || [];

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
      <ShipmentsTable columns={columns} tableData={graphqlToTableTransformer(data)} />
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

export default TransferShipmentOverviewView;
