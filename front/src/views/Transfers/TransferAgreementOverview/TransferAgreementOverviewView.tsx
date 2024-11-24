import { useCallback, useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { graphql, ResultOf } from "../../../../../graphql";
import { Alert, AlertIcon, Button, Heading, Stack, useDisclosure } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { TRANSFER_AGREEMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { Row } from "react-table";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { FilteringSortingTable } from "components/Table/Table";
import { SelectColumnFilter } from "components/Table/Filter";
import { BreadcrumbNavigation } from "components/BreadcrumbNavigation";
import {
  CanAcceptTransferAgreementState,
  DirectionCell,
  IExtendedTransferAgreementState,
  ShipmentCell,
  StatusCell,
} from "./components/TableCells";
import TransferAgreementsOverlay from "./components/TransferAgreementOverlay";
import { ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY } from "../CreateShipment/CreateShipmentView";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import { introspection_types } from "../../../../../generated/graphql-env";

export interface IAcceptedTransferAgreement {
  transferAgreements: introspection_types["TransferAgreement"][];
}
export const ALL_TRANSFER_AGREEMENTS_QUERY = graphql(
  `
    query TransferAgreements {
      transferAgreements(states: [Accepted, UnderReview, Rejected, Canceled, Expired]) {
        ...TransferAgreementFields
      }
    }
  `,
  [TRANSFER_AGREEMENT_FIELDS_FRAGMENT],
);

export const ACCEPT_TRANSFER_AGREEMENT = graphql(
  `
    mutation AcceptTransferAgreement($id: ID!) {
      acceptTransferAgreement(id: $id) {
        ...TransferAgreementFields
      }
    }
  `,
  [TRANSFER_AGREEMENT_FIELDS_FRAGMENT],
);

export const REJECT_TRANSFER_AGREEMENT = graphql(
  `
    mutation RejectTransferAgreement($id: ID!) {
      rejectTransferAgreement(id: $id) {
        ...TransferAgreementFields
      }
    }
  `,
  [TRANSFER_AGREEMENT_FIELDS_FRAGMENT],
);

export const CANCEL_TRANSFER_AGREEMENT = graphql(
  `
    mutation CancelTransferAgreement($id: ID!) {
      cancelTransferAgreement(id: $id) {
        ...TransferAgreementFields
      }
    }
  `,
  [TRANSFER_AGREEMENT_FIELDS_FRAGMENT],
);

interface IShipmentBase {
  __typename?: "Base";
  id: string;
  name: string;
  count?: number;
}

function TransferAgreementOverviewView() {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();

  // variables in URL
  const { baseId } = useBaseIdParam();

  const { isOpen, onClose, onOpen } = useDisclosure();
  // State to pass Data from a row to the Overlay
  const [transferAgreementOverlayData, setTransferAgreementOverlayData] = useState({});

  // callback function triggered when a state button is clicked.
  const openTransferAgreementOverlay = useCallback(
    ({ original: cellData }: Row<any>) => {
      setTransferAgreementOverlayData(cellData);
      onOpen();
    },
    [onOpen, setTransferAgreementOverlayData],
  );

  // Mutations for transfer agreement actions
  const [acceptTransferAgreementMutation, acceptTransferAgreementMutationStatus] = useMutation(
    ACCEPT_TRANSFER_AGREEMENT,
    {
      update(cache, { data: returnedTransferAgreement }) {
        if (returnedTransferAgreement?.acceptTransferAgreement) {
          const acceptedTransferAgreement = returnedTransferAgreement?.acceptTransferAgreement;

          const existingAcceptedTransferAgreementsData = cache.readQuery({
            query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
            variables: { baseId },
          });

          if (existingAcceptedTransferAgreementsData?.transferAgreements) {
            const updatedTransferAgreements = [
              ...(existingAcceptedTransferAgreementsData.transferAgreements || []), // Use existing array or an empty array
              acceptedTransferAgreement,
            ];

            cache.writeQuery({
              query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
              variables: { baseId },
              data: {
                transferAgreements: updatedTransferAgreements,
              },
            });
          } else {
            cache.writeQuery({
              query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
              variables: { baseId },
              data: {
                transferAgreements: [acceptedTransferAgreement],
              },
            });
          }
        }
      },
    },
  );

  const [rejectTransferAgreementMutation, rejectTransferAgreementMutationStatus] =
    useMutation(REJECT_TRANSFER_AGREEMENT);

  const [cancelTransferAgreementMutation, cancelTransferAgreementMutationStatus] = useMutation(
    CANCEL_TRANSFER_AGREEMENT,
    {
      update(cache, { data: returnedTransferAgreement }) {
        if (returnedTransferAgreement?.cancelTransferAgreement) {
          const cancelledTransferAgreementId =
            returnedTransferAgreement?.cancelTransferAgreement.id;

          const existingAcceptedTransferAgreementsData =
            cache.readQuery<IAcceptedTransferAgreement>({
              query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
              variables: { baseId },
            });

          const index = existingAcceptedTransferAgreementsData?.transferAgreements.findIndex(
            (a) => a.id === cancelledTransferAgreementId,
          );

          if (index !== undefined && index > -1) {
            existingAcceptedTransferAgreementsData?.transferAgreements.splice(index, 1);

            cache.writeQuery({
              query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
              variables: {
                baseId,
              },
              data: {
                transferAgreements: existingAcceptedTransferAgreementsData?.transferAgreements,
              },
            });
          }
        }
      },
    },
  );

  const isLoadingFromMutation =
    acceptTransferAgreementMutationStatus.loading ||
    rejectTransferAgreementMutationStatus.loading ||
    cancelTransferAgreementMutationStatus.loading;

  // transfer agreement actions in the different modals
  const handleTransferAgreement = useCallback(
    (mutation, kind) => (id) => {
      mutation({
        variables: { id },
      })
        .then((res) => {
          if (!res?.errors) {
            onClose();
            createToast({
              type: "success",
              message: `Successfully ${kind}ed the transfer agreement.`,
            });
          } else {
            triggerError({ message: `Could not ${kind} the transfer agreement.` });
          }
        })
        .catch(() => {
          triggerError({ message: `Could not ${kind} the transfer agreement.` });
        });
    },
    [onClose, createToast, triggerError],
  );

  const onAccept = handleTransferAgreement(acceptTransferAgreementMutation, "accept");
  const onReject = handleTransferAgreement(rejectTransferAgreementMutation, "reject");
  const onCancel = handleTransferAgreement(cancelTransferAgreementMutation, "cancel");

  // fetch agreements data
  const { loading, error, data } = useQuery(ALL_TRANSFER_AGREEMENTS_QUERY, {
    // returns cache first, but syncs with server in background
    fetchPolicy: "cache-and-network",
  });

  // transform agreements data for UI
  const graphqlToTableTransformer = (
    transferAgreementQueryResult: ResultOf<typeof ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY>,
  ) =>
    transferAgreementQueryResult?.transferAgreements.map((element) => {
      if (globalPreferences.organisation !== undefined) {
        const currentOrgId = parseInt(globalPreferences.organisation.id, 10);
        const sourceOrgId = parseInt(element.sourceOrganisation.id, 10);
        const targetOrgId = parseInt(element.targetOrganisation.id, 10);

        const agreementRow = {
          id: element.id,
          direction: "Bidirectional",
          partnerOrg: element.targetOrganisation.name,
          state: element.state as IExtendedTransferAgreementState,
          shipments: {},
          comment: element.comment,
          validUntil: element.validUntil
            ? new Intl.DateTimeFormat().format(new Date(element.validUntil))
            : "",
          requestedOn: new Intl.DateTimeFormat().format(new Date(element.requestedOn)),
          requestedBy: element.requestedBy.name,
        };

        if (element.type === "Bidirectional") {
          // We can do both
          agreementRow.direction = "Bidirectional";
          if (currentOrgId === sourceOrgId) {
            agreementRow.partnerOrg = element.targetOrganisation.name;
          } else if (currentOrgId === targetOrgId) {
            agreementRow.partnerOrg = element.sourceOrganisation.name;
          }
        } else if (currentOrgId === sourceOrgId) {
          // we are can only send stock to the partner
          agreementRow.direction = "SendingTo";
          agreementRow.partnerOrg = element.targetOrganisation.name;
        } else if (currentOrgId === targetOrgId) {
          // we are can only receive items from the partner
          agreementRow.direction = "ReceivingFrom";
          agreementRow.partnerOrg = element.sourceOrganisation.name;
        }

        // The initiating Org is not always the sourceOrg. Therefore, we need to do this complex if statement
        if (
          element.state === "UnderReview" &&
          ((currentOrgId === targetOrgId &&
            (element.type === "Bidirectional" || element.type === "SendingTo")) ||
            (currentOrgId === sourceOrgId && element.type === "ReceivingFrom"))
        ) {
          // You can accept this agreement if it is UnderReview and the partnerOrg created it
          agreementRow.state = CanAcceptTransferAgreementState.CanAccept;
        }

        // prepare shipment data
        const shipmentsTmp = [] as IShipmentBase[];
        element.shipments.forEach((shipment) => {
          if (
            (shipment.state === "Preparing" ||
              shipment.state === "Sent" ||
              shipment.state === "Receiving") &&
            globalPreferences.availableBases !== undefined
          ) {
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
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Partner",
        accessor: "partnerOrg",
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "state",
        Cell: ({ ...cellProps }) => (
          <StatusCell onClick={openTransferAgreementOverlay} {...cellProps} />
        ),
        Filter: SelectColumnFilter,
        filter: "includesSome",
      },
      {
        Header: "Shipments",
        accessor: "shipments",
        disableFilters: true,
        Cell: ShipmentCell,
      },
      {
        Header: "Comments",
        accessor: "comment",
        disableFilters: true,
      },
      {
        Header: "Valid Until",
        accessor: "validUntil",
        disableFilters: true,
      },
    ],
    [openTransferAgreementOverlay],
  );

  // error and loading handling
  let transferAgreementTable;
  if (error) {
    transferAgreementTable = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch transfer agreement data! Please try reloading the page.
      </Alert>
    );
  } else if (loading || isGlobalStateLoading) {
    transferAgreementTable = <TableSkeleton />;
  } else {
    transferAgreementTable = (
      <FilteringSortingTable columns={columns} tableData={graphqlToTableTransformer(data)} />
    );
  }

  return (
    <>
      <BreadcrumbNavigation items={[{ label: "Aid Transfers" }, { label: "My Network" }]} />
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

      <TransferAgreementsOverlay
        isOpen={isOpen}
        isLoading={isLoadingFromMutation}
        transferAgreementOverlayData={transferAgreementOverlayData}
        onClose={onClose}
        onAccept={onAccept}
        onReject={onReject}
        onCancel={onCancel}
      />
    </>
  );
}

export default TransferAgreementOverviewView;
