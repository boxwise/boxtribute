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
import { TransferAgreementsQuery, TransferAgreementType } from "types/generated/graphql";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import TransferAgreementTable from "./components/TransferAgreementTable";
import { DirectionCell } from "./components/TableCells";

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
          state: element.state,
          comment: element.comment,
          validUntil: element.validUntil,
        };

        if (
          (element.type === TransferAgreementType.SendingTo && currentOrgId === sourceOrgId) ||
          (element.type === TransferAgreementType.ReceivingFrom && currentOrgId === targetOrgId)
        ) {
          // We can send items to the partner org
          agreementRow.direction = TransferAgreementType.SendingTo;
        } else if (
          (element.type === TransferAgreementType.ReceivingFrom && currentOrgId === sourceOrgId) ||
          (element.type === TransferAgreementType.SendingTo && currentOrgId === targetOrgId)
        ) {
          // We can receive items to the partner org
          agreementRow.direction = TransferAgreementType.ReceivingFrom;
        } else if (element.type === TransferAgreementType.Bidirectional) {
          agreementRow.direction = TransferAgreementType.Bidirectional;
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

  const { loading, error, data } = useQuery<TransferAgreementsQuery>(ALL_TRANSFER_AGREEMENTS_QUERY);

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
        // TODO: move to global component
        <TableSkeleton />
      ) : (
        <TransferAgreementTable columns={columns} tableData={graphqlToTableTransformer(data)} />
      )}
    </>
  );
}

export default TransferAgreementOverviewView;
