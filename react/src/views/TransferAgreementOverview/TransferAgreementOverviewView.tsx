import { gql, useQuery } from "@apollo/client";
// import { useNavigate, useParams } from "react-router-dom";
import APILoadingIndicator from "components/APILoadingIndicator";
import {
  BASE_BASIC_FIELDS_FRAGMENT,
  ORGANISATION_BASIC_FIELDS_FRAGMENT,
  USER_BASIC_FIELDS_FRAGMENT,
} from "queries/fragments";
import { TransferAgreementsQuery, TransferAgreementType } from "types/generated/graphql";
import { useContext, useMemo } from "react";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import TransferAgreementTable from "./TransferAgreementTable";

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
  // const navigate = useNavigate();
  // const baseId = useParams<{ baseId: string }>().baseId!;

  const graphqlToTableTransformer = (
    transferAgreementQueryResult: TransferAgreementsQuery | undefined,
  ) =>
    transferAgreementQueryResult?.transferAgreements.map((element) => {
      if (globalPreferences.selectedOrganisationId !== undefined) {
        const row = {
          direction: "from/to",
          state: element.state,
          comments: element.comment,
          validUntil: element.validUntil,
        };
        if (
          parseInt(globalPreferences.selectedOrganisationId, 10) ===
            parseInt(element.sourceOrganisation.id, 10) &&
          element.type === TransferAgreementType.Unidirectional
        ) {
          row.direction = "to";
        } else if (
          parseInt(globalPreferences.selectedOrganisationId, 10) ===
            parseInt(element.targetOrganisation.id, 10) &&
          element.type === TransferAgreementType.Unidirectional
        ) {
          row.direction = "from";
        }
        return row;
      }
      return undefined;
    }) || [];

  const columns = useMemo(
    () => [
      {
        Header: "",
        accessor: "direction",
      },
      {
        Header: "Status",
        accessor: "state",
      },
      {
        Header: "Comments",
        accessor: "comments",
      },
      {
        Header: "Valid Until",
        accessor: "validUntil",
      },
    ],
    [],
  );

  const { loading, error, data } = useQuery<TransferAgreementsQuery>(ALL_TRANSFER_AGREEMENTS_QUERY);
  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    return <div>Error!</div>;
  }

  return <TransferAgreementTable columns={columns} tableData={graphqlToTableTransformer(data)} />;
}

export default TransferAgreementOverviewView;
