import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Center,
  Heading,
  VStack,
  Flex,
  Spacer,
  Button,
  Alert,
  AlertIcon,
  Skeleton,
  useDisclosure,
} from "@chakra-ui/react";
import _, { groupBy } from "lodash";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CancelShipmentMutation,
  CancelShipmentMutationVariables,
  SendShipmentMutation,
  SendShipmentMutationVariables,
  Shipment,
  ShipmentByIdQuery,
  ShipmentByIdQueryVariables,
  ShipmentDetail,
  ShipmentState,
  StartReceivingShipmentMutation,
  StartReceivingShipmentMutationVariables,
  TransferAgreementType,
  UpdateShipmentWhenPreparingMutation,
  UpdateShipmentWhenPreparingMutationVariables,
  UpdateShipmentWhenReceivingMutation,
  UpdateShipmentWhenReceivingMutationVariables,
} from "types/generated/graphql";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ButtonSkeleton, ShipmentCardSkeletons, TabsSkeleton } from "components/Skeletons";
import ShipmentCard from "./components/ShipmentCard";
import ShipmentTabs from "./components/ShipmentTabs";

export const SHIPMENT_BY_ID_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const UPDATE_SHIPMENT_WHEN_PREPARING = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation UpdateShipmentWhenPreparing(
    $id: ID!
    $removedBoxLabelIdentifiers: [String!]
    $preparedBoxLabelIdentifiers: [String!]
  ) {
    updateShipmentWhenPreparing(
      updateInput: {
        id: $id
        preparedBoxLabelIdentifiers: $preparedBoxLabelIdentifiers
        removedBoxLabelIdentifiers: $removedBoxLabelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const UPDATE_SHIPMENT_WHEN_RECEIVING = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation UpdateShipmentWhenReceiving(
    $id: ID!
    $receivedShipmentDetailUpdateInputs: [ShipmentDetailUpdateInput!]
    $lostBoxLabelIdentifiers: [String!]
  ) {
    updateShipmentWhenReceiving(
      updateInput: {
        id: $id
        receivedShipmentDetailUpdateInputs: $receivedShipmentDetailUpdateInputs
        lostBoxLabelIdentifiers: $lostBoxLabelIdentifiers
      }
    ) {
      ...ShipmentFields
    }
  }
`;

export const SEND_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation SendShipment($id: ID!) {
    sendShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const CANCEL_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation CancelShipment($id: ID!) {
    cancelShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

export const START_RECEIVING_SHIPMENT = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation StartReceivingShipment($id: ID!) {
    startReceivingShipment(id: $id) {
      ...ShipmentFields
    }
  }
`;

function ShipmentView() {
  const { triggerError } = useErrorHandling();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { createToast } = useNotification();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { isOpen, onClose, onOpen } = useDisclosure();
  // Basics
  const [showRemoveIcon, setShowRemoveIcon] = useState(false);

  // variables in URL
  const id = useParams<{ id: string }>().id!;

  // fetch shipment data
  const { loading, error, data } = useQuery<ShipmentByIdQuery, ShipmentByIdQueryVariables>(
    SHIPMENT_BY_ID_QUERY,
    {
      variables: {
        id,
      },
    },
  );

  // Mutations for shipment actions
  const [updateShipmentWhenPreparing, updateShipmentWhenPreparingStatus] = useMutation<
    UpdateShipmentWhenPreparingMutation,
    UpdateShipmentWhenPreparingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_PREPARING);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [updateShipmentWhenReceiving, updateShipmentWhenReceivingStatus] = useMutation<
    UpdateShipmentWhenReceivingMutation,
    UpdateShipmentWhenReceivingMutationVariables
  >(UPDATE_SHIPMENT_WHEN_RECEIVING);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [cancelShipment, cancelShipmentStatus] = useMutation<
    CancelShipmentMutation,
    CancelShipmentMutationVariables
  >(CANCEL_SHIPMENT);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [sendShipment, sendShipmentStatus] = useMutation<
    SendShipmentMutation,
    SendShipmentMutationVariables
  >(SEND_SHIPMENT);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [startReceivingShipment, startReceivingShipmentStatus] = useMutation<
    StartReceivingShipmentMutation,
    StartReceivingShipmentMutationVariables
  >(START_RECEIVING_SHIPMENT);

  const onRemove = () => setShowRemoveIcon(!showRemoveIcon);

  const onBoxRemoved = (boxLabelIdentifier: string) => {
    createToast({
      title: `Box ${boxLabelIdentifier}`,
      type: "success",
      message: "Successfully removed the box from the shipment",
    });

    updateShipmentWhenPreparing({
      variables: {
        id,
        preparedBoxLabelIdentifiers: [],
        removedBoxLabelIdentifiers: [boxLabelIdentifier],
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not remove box",
          });
        } else {
          createToast({
            title: `Box ${boxLabelIdentifier}`,
            type: "success",
            message: "Successfully removed the box from the shipment",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not remove the box from the shipment.",
        });
      });
  };

  const onBulkBoxRemoved = (boxLabelIdentifiers: string[]) => {
    createToast({
      title: `Box ${boxLabelIdentifiers}`,
      type: "success",
      message: "Successfully removed the box from the shipment",
    });

    setShowRemoveIcon(false);
    // eslint-disable-next-line no-console
    updateShipmentWhenPreparing({
      variables: {
        id,
        preparedBoxLabelIdentifiers: [],
        removedBoxLabelIdentifiers: boxLabelIdentifiers,
      },
    })
      .then((mutationResult) => {
        if (mutationResult?.errors) {
          triggerError({
            message: "Error: Could not remove box",
          });
        } else {
          createToast({
            title: `Box ${boxLabelIdentifiers}`,
            type: "success",
            message: "Successfully removed the box from the shipment",
          });
        }
      })
      .catch(() => {
        triggerError({
          message: "Could not remove the box from the shipment.",
        });
      });
  };

  const isLoadingFromMutation = updateShipmentWhenPreparingStatus.loading;

  const isSender =
    typeof globalPreferences.availableBases?.find(
      (b) =>
        b.id === data?.shipment?.sourceBase.id ||
        (b.id === data?.shipment?.targetBase.id &&
          data.shipment?.transferAgreement.type === TransferAgreementType.Bidirectional),
    ) !== "undefined";

  // eslint-disable-next-line no-console
  console.log("globalPreferences.availableBases", globalPreferences.availableBases);

  // transform shipment data for UI
  const shipmentState = data?.shipment?.state;
  const shipmentContents = data?.shipment?.details as unknown as ShipmentDetail[];

  // map over each ShipmentDetail to extract its history records
  const historyEntries = shipmentContents?.flatMap((detail) =>
    detail?.box?.history?.map((entry) => ({
      ...entry,
      labelIdentifier: detail.box?.labelIdentifier,
    })),
  );

  // group the history entries by their changeDate property
  const groupedHistoryEntries = groupBy(historyEntries, (entry) => {
    const date = new Date(entry?.changeDate);
    return `${date.toLocaleString("default", { month: "short" })}
     ${date.getDate()}, ${date.getFullYear()}`;
  });

  // sort each array of history entries in descending order
  const sortedGroupedHistoryEntries = _.chain(groupedHistoryEntries)
    .toPairs()
    .map(([date, entries]) => ({
      date,
      entries: _.orderBy(entries, (entry) => new Date(entry?.changeDate), "desc"),
    }))
    .orderBy("date", "desc")
    .value();

  // eslint-disable-next-line no-console
  console.log("sortedGroupedHistoryEntries", sortedGroupedHistoryEntries);

  // error and loading handling
  let shipmentTitle;
  let shipmentTab;
  let shipmentCard;
  let shipmentActionButtons;
  if (error) {
    shipmentTab = (
      <Alert status="error" data-testid="ErrorAlert">
        <AlertIcon />
        Could not fetch Shipment data! Please try reloading the page.
      </Alert>
    );
  } else if (loading) {
    shipmentTitle = <Skeleton height="50px" width="200px" />;
    shipmentCard = <ShipmentCardSkeletons />;
    shipmentTab = <TabsSkeleton />;
    shipmentActionButtons = <ButtonSkeleton />;
  } else {
    if (ShipmentState.Preparing === shipmentState && isSender) {
      shipmentTitle = <Heading>Prepare Shipment</Heading>;
      shipmentActionButtons = (
        <Button
          leftIcon={<SendingIcon />}
          colorScheme="green"
          isDisabled={shipmentContents.length === 0}
          isLoading={isLoadingFromMutation}
          variant="solid"
          marginTop={2}
        >
          Finalize & Send
        </Button>
      );
    } else if (ShipmentState.Preparing !== shipmentState && isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = <Box />;
    } else if (ShipmentState.Receiving === shipmentState && !isSender) {
      shipmentTitle = <Heading>Receive Shipment</Heading>;
      shipmentActionButtons = <Box />;
    } else if (ShipmentState.Preparing !== shipmentState && !isSender) {
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = <Box />;
    } else {
      shipmentTitle = <Heading>View Shipment</Heading>;
      shipmentActionButtons = <Box />;
    }

    // eslint-disable-next-line no-console
    console.log("isSender", isSender);

    shipmentTab = (
      <ShipmentTabs
        detail={shipmentContents}
        histories={sortedGroupedHistoryEntries}
        onBoxRemoved={onBoxRemoved}
        onBulkBoxRemoved={onBulkBoxRemoved}
        showRemoveIcon={showRemoveIcon}
      />
    );

    shipmentCard = (
      <ShipmentCard onRemove={onRemove} shipment={data?.shipment as unknown as Shipment} />
    );
  }

  return (
    <Flex direction="column" gap={2}>
      <Center>
        <VStack>
          {shipmentTitle}
          {shipmentCard}
        </VStack>
      </Center>
      <Spacer />
      <Box>{shipmentTab}</Box>

      {shipmentActionButtons}
    </Flex>
  );
}

export default ShipmentView;
