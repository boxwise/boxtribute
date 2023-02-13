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

function TransferAgreementOverviewView() {
  const { globalPreferences } = useContext(GlobalPreferencesContext);

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

        return agreementRow;
      }
      return undefined;
    }) || [];

  const columns = useMemo(
    () => [
      {
        Header: "",
        accessor: "direction",
        Cell: DirectionCell,
      },
      {
        Header: "Partner Agreements",
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

  const { loading, error, data } = useQuery<TransferAgreementsQuery>(
    ALL_TRANSFER_AGREEMENTS_QUERY,
    {
      errorPolicy: "all",
    },
  );

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
      {error && (
        <Alert status="error">
          <AlertIcon />
          Could not fetch transfer agreement data! Please try reloading the page.
        </Alert>
      )}
      {loading ? (
        <TableSkeleton />
      ) : (
        <TransferAgreementTable columns={columns} tableData={graphqlToTableTransformer(data)} />
      )}
    </>
  );
}

export default TransferAgreementOverviewView;
