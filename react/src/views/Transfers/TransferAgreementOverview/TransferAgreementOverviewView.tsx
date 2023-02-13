import { useContext, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Button, Heading, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import {
  BASE_BASIC_FIELDS_FRAGMENT,
  ORGANISATION_BASIC_FIELDS_FRAGMENT,
  USER_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import {
  TransferAgreementsQuery,
  TransferAgreementState,
  TransferAgreementType,
} from "types/generated/graphql";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import TransferAgreementTable from "./components/TransferAgreementTable";
import {
  CanAcceptTransferAgreementState,
  DirectionCell,
  IExtendedTransferAgreementState,
  ShipmentCell,
  StatusCell,
} from "./components/TableCells";

export const ALL_TRANSFER_AGREEMENTS_QUERY = gql`
  ${ORGANISATION_BASIC_FIELDS_FRAGMENT}
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  query TransferAgreements {
    transferAgreements(states: [Accepted, UnderReview, Rejected, Canceled, Rejected]) {
      id
      type
      state
      comment
      validFrom
      validUntil
      sourceOrganisation {
        ...OrganisationBasicFields
      }
      sourceBases {
        ...BaseBasicFields
      }
      targetOrganisation {
        ...OrganisationBasicFields
      }
      targetBases {
        ...BaseBasicFields
      }
      shipments {
        sourceBase {
          ...BaseBasicFields
        }
        targetBase {
          ...BaseBasicFields
        }
      }
      requestedOn
      requestedBy {
        ...UserBasicFields
      }
      acceptedOn
      acceptedBy {
        ...UserBasicFields
      }
      terminatedOn
      terminatedBy {
        ...UserBasicFields
      }
    }
  }
`;

interface IShipmentBase {
  __typename?: "Base";
  id: string;
  name: string;
  count?: number;
}

function TransferAgreementOverviewView() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  // fetch agreements data
  const { loading, error, data } = useQuery<TransferAgreementsQuery>(
    ALL_TRANSFER_AGREEMENTS_QUERY,
    {
      errorPolicy: "all",
    },
  );

  // transform data for UI
  const graphqlToTableTransformer = (
    transferAgreementQueryResult: TransferAgreementsQuery | undefined,
  ) =>
    transferAgreementQueryResult?.transferAgreements.map((element) => {
      if (globalPreferences.selectedOrganisationId !== undefined) {
        const currentOrgId = parseInt(globalPreferences.selectedOrganisationId, 10);
        const sourceOrgId = parseInt(element.sourceOrganisation.id, 10);
        const targetOrgId = parseInt(element.targetOrganisation.id, 10);

        const agreementRow = {
          direction: TransferAgreementType.Bidirectional,
          partnerOrg: element.targetOrganisation.name,
          state: element.state as IExtendedTransferAgreementState,
          shipments: {},
          comment: element.comment,
          validUntil: element.validUntil,
        };

        if (element.type === TransferAgreementType.SendingTo && currentOrgId === sourceOrgId) {
          // We can send items to the partner org
          agreementRow.direction = TransferAgreementType.SendingTo;
          agreementRow.partnerOrg = element.targetOrganisation.name;
        } else if (
          element.type === TransferAgreementType.ReceivingFrom &&
          currentOrgId === targetOrgId
        ) {
          // We can send items to the partner org
          agreementRow.direction = TransferAgreementType.SendingTo;
          agreementRow.partnerOrg = element.sourceOrganisation.name;
        } else if (
          element.type === TransferAgreementType.ReceivingFrom &&
          currentOrgId === sourceOrgId
        ) {
          // We can receive items to the partner org
          agreementRow.direction = TransferAgreementType.ReceivingFrom;
          agreementRow.partnerOrg = element.targetOrganisation.name;
        } else if (
          element.type === TransferAgreementType.SendingTo &&
          currentOrgId === targetOrgId
        ) {
          // We can receive items to the partner org
          agreementRow.direction = TransferAgreementType.ReceivingFrom;
          agreementRow.partnerOrg = element.sourceOrganisation.name;
        } else if (element.type === TransferAgreementType.Bidirectional) {
          // We can do both
          agreementRow.direction = TransferAgreementType.Bidirectional;
          if (currentOrgId === sourceOrgId) {
            agreementRow.partnerOrg = element.targetOrganisation.name;
          } else if (currentOrgId === targetOrgId) {
            agreementRow.partnerOrg = element.sourceOrganisation.name;
          }
        }

        if (element.state === TransferAgreementState.UnderReview && currentOrgId === targetOrgId) {
          // You can accept this Agreement if it is UnderReview since the partnerOrg created it
          agreementRow.state = CanAcceptTransferAgreementState.CanAccept;
        }

        // prepare shipment data
        const shipmentsTmp = [] as IShipmentBase[];
        element.shipments.forEach((shipment) => {
          if (globalPreferences.availableBases !== undefined) {
            if (
              shipment.targetBase != null &&
              globalPreferences.availableBases.findIndex(
                ({ id }) => shipment.targetBase?.id === id,
              ) === -1
            ) {
              shipmentsTmp.push(shipment.targetBase);
            } else if (
              shipment.sourceBase != null &&
              globalPreferences.availableBases.findIndex(
                ({ id }) => shipment.sourceBase?.id === id,
              ) === -1
            ) {
              shipmentsTmp.push(shipment.sourceBase);
            }
          }
        });

        agreementRow.shipments = shipmentsTmp.reduce((acc, { id, name }) => {
          const count = acc[id] ? acc[id].count + 1 : 1;
          acc[id] = { id, name, count };
          return acc;
        }, {});

        return agreementRow;
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
      },
      {
        Header: "Partner",
        accessor: "partnerOrg",
      },
      {
        Header: "Status",
        accessor: "state",
        Cell: StatusCell,
      },
      {
        Header: "Shipments",
        accessor: "shipments",
        Cell: ShipmentCell,
      },
      {
        Header: "Comments",
        accessor: "comment",
      },
      {
        Header: "Valid Until",
        accessor: "validUntil",
      },
    ],
    [],
  );

  let transferAgreementTable;
  if (error) {
    transferAgreementTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch transfer agreement data! Please try reloading the page.
      </Alert>
    );
  } else if (loading) {
    transferAgreementTable = <TableSkeleton />;
  } else {
    transferAgreementTable = (
      <TransferAgreementTable columns={columns} tableData={graphqlToTableTransformer(data)} />
    );
  }

  return (
    <>
      <Heading fontWeight="bold" mb={4} as="h2">
        My Transfer Network
      </Heading>
      <Stack direction="row" my={4} spacing={4}>
        <Link to="create">
          <Button leftIcon={<AddIcon />} borderRadius="0">
            Create Agreement
          </Button>
        </Link>
      </Stack>
      {transferAgreementTable}
    </>
  );
}

export default TransferAgreementOverviewView;
