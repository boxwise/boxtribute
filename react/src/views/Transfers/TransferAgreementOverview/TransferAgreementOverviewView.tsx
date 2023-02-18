import { useCallback, useContext, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Button, Heading, Stack, useDisclosure } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { TRANSFER_AGREEMENT_FIELDS_FRAGMENT } from "queries/fragments";
import {
  AcceptTransferAgreementMutation,
  AcceptTransferAgreementMutationVariables,
  CancelTransferAgreementMutation,
  CancelTransferAgreementMutationVariables,
  RejectTransferAgreementMutation,
  RejectTransferAgreementMutationVariables,
  TransferAgreementsQuery,
  TransferAgreementState,
  TransferAgreementType,
} from "types/generated/graphql";
import { AddIcon } from "@chakra-ui/icons";
import { TableSkeleton } from "components/Skeletons";
import { Row } from "react-table";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import { SelectColumnFilter } from "components/Table/Filter";
import TransferAgreementTable from "./components/TransferAgreementTable";
import {
  CanAcceptTransferAgreementState,
  DirectionCell,
  IExtendedTransferAgreementState,
  ShipmentCell,
  StatusCell,
} from "./components/TableCells";
import TransferAgreementsOverlay from "./components/TransferAgreementOverlay";

export const ALL_TRANSFER_AGREEMENTS_QUERY = gql`
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  query TransferAgreements {
    transferAgreements(states: [Accepted, UnderReview, Rejected, Canceled, Expired]) {
      ...TransferAgreementFields
    }
  }
`;

export const ACCEPT_TRANSFER_AGREEMENT = gql`
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  mutation AcceptTransferAgreement($id: ID!) {
    acceptTransferAgreement(id: $id) {
      ...TransferAgreementFields
    }
  }
`;

export const REJECT_TRANSFER_AGREEMENT = gql`
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  mutation RejectTransferAgreement($id: ID!) {
    rejectTransferAgreement(id: $id) {
      ...TransferAgreementFields
    }
  }
`;

export const CANCEL_TRANSFER_AGREEMENT = gql`
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  mutation CancelTransferAgreement($id: ID!) {
    cancelTransferAgreement(id: $id) {
      ...TransferAgreementFields
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
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
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
  const [acceptTransferAgreementMutation, acceptTransferAgreementMutationStatus] = useMutation<
    AcceptTransferAgreementMutation,
    AcceptTransferAgreementMutationVariables
  >(ACCEPT_TRANSFER_AGREEMENT);

  const [rejectTransferAgreementMutation, rejectTransferAgreementMutationStatus] = useMutation<
    RejectTransferAgreementMutation,
    RejectTransferAgreementMutationVariables
  >(REJECT_TRANSFER_AGREEMENT);

  const [cancelTransferAgreementMutation, cancelTransferAgreementMutationStatus] = useMutation<
    CancelTransferAgreementMutation,
    CancelTransferAgreementMutationVariables
  >(CANCEL_TRANSFER_AGREEMENT);

  const isLoadingFromMutation =
    acceptTransferAgreementMutationStatus.loading ||
    rejectTransferAgreementMutationStatus.loading ||
    cancelTransferAgreementMutationStatus.loading;

  // transfer agreement actions in the different modals
  const onAccept = useCallback(
    (id: string) => {
      acceptTransferAgreementMutation({
        variables: {
          id,
        },
      })
        .then((res) => {
          if (!res?.errors) {
            onClose();
            createToast({
              type: "success",
              message: "Successfully accepted the transfer agreement.",
            });
          } else {
            triggerError({ message: "Could not accept the transfer agreement." });
          }
        })
        .catch(() => {
          triggerError({ message: "Could not accept the transfer agreement." });
        });
    },
    [acceptTransferAgreementMutation, onClose, createToast, triggerError],
  );

  const onReject = useCallback(
    (id: string) => {
      rejectTransferAgreementMutation({
        variables: {
          id,
        },
      })
        .then((res) => {
          if (!res?.errors) {
            onClose();
            createToast({
              type: "success",
              message: "Successfully rejected the transfer agreement.",
            });
          } else {
            triggerError({ message: "Could not reject the transfer agreement." });
          }
        })
        .catch(() => {
          triggerError({ message: "Could not reject the transfer agreement." });
        });
    },
    [rejectTransferAgreementMutation, onClose, createToast, triggerError],
  );

  const onCancel = useCallback(
    (id: string) => {
      cancelTransferAgreementMutation({
        variables: {
          id,
        },
      })
        .then((res) => {
          if (!res?.errors) {
            onClose();
            createToast({
              type: "success",
              message: "Successfully canceled the transfer agreement.",
            });
          } else {
            triggerError({ message: "Could not cancel the transfer agreement." });
          }
        })
        .catch(() => {
          triggerError({ message: "Could not cancel the transfer agreement." });
        });
    },
    [cancelTransferAgreementMutation, onClose, createToast, triggerError],
  );

  // fetch agreements data
  const { loading, error, data } = useQuery<TransferAgreementsQuery>(ALL_TRANSFER_AGREEMENTS_QUERY);

  // transform agreements data for UI
  const graphqlToTableTransformer = (
    transferAgreementQueryResult: TransferAgreementsQuery | undefined,
  ) =>
    transferAgreementQueryResult?.transferAgreements.map((element) => {
      if (globalPreferences.selectedOrganisationId !== undefined) {
        const currentOrgId = parseInt(globalPreferences.selectedOrganisationId, 10);
        const sourceOrgId = parseInt(element.sourceOrganisation.id, 10);
        const targetOrgId = parseInt(element.targetOrganisation.id, 10);

        const agreementRow = {
          id: element.id,
          direction: TransferAgreementType.Bidirectional,
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

        if (element.type === TransferAgreementType.Bidirectional) {
          // We can do both
          agreementRow.direction = TransferAgreementType.Bidirectional;
          if (currentOrgId === sourceOrgId) {
            agreementRow.partnerOrg = element.targetOrganisation.name;
          } else if (currentOrgId === targetOrgId) {
            agreementRow.partnerOrg = element.sourceOrganisation.name;
          }
        } else if (currentOrgId === sourceOrgId) {
          // we are can only send stock to the partner
          agreementRow.direction = TransferAgreementType.SendingTo;
          agreementRow.partnerOrg = element.targetOrganisation.name;
        } else if (currentOrgId === targetOrgId) {
          // we are can only receive items from the partner
          agreementRow.direction = TransferAgreementType.ReceivingFrom;
          agreementRow.partnerOrg = element.sourceOrganisation.name;
        }

        // The initiating Org is not always the sourceOrg. Therefore, we need to do this complex if statement
        if (
          element.state === TransferAgreementState.UnderReview &&
          ((currentOrgId === targetOrgId &&
            (element.type === TransferAgreementType.Bidirectional ||
              element.type === TransferAgreementType.SendingTo)) ||
            (currentOrgId === sourceOrgId && element.type === TransferAgreementType.ReceivingFrom))
        ) {
          // You can accept this agreement if it is UnderReview and the partnerOrg created it
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
        // eslint-disable-next-line react/no-unstable-nested-components
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
