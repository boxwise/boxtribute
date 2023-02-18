import { useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";

import {
  AllAcceptedTransferAgreementsQuery,
  CreateTransferShipmentMutation,
  CreateTransferShipmentMutationVariables,
  TransferAgreementType,
} from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  TRANSFER_AGREEMENT_FIELDS_FRAGMENT,
} from "queries/fragments";
import CreateTransferShipment, {
  IOrganisationsAgreementsDataData,
  ITransferShipmentFormData,
} from "./components/CreateShipment";

export const ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY = gql`
  ${BASE_ORG_FIELDS_FRAGMENT}
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  query AllAcceptedTransferAgreements($baseId: ID!) {
    base(id: $baseId) {
      ...BaseOrgFields
    }

    transferAgreements(states: Accepted) {
      ...TransferAgreementFields
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation CreateTransferShipment(
    $sourceBaseId: Int!
    $targetBaseId: Int!
    $transferAgreementId: Int!
  ) {
    createShipment(
      creationInput: {
        sourceBaseId: $sourceBaseId
        targetBaseId: $targetBaseId
        transferAgreementId: $transferAgreementId
      }
    ) {
      ...ShipmentFields
    }
  }
`;

function CreateShipmentView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  // variables in URL
  const baseId = useParams<{ baseId: string }>().baseId!;

  // Query Data for the Form
  const allFormOptions = useQuery<AllAcceptedTransferAgreementsQuery>(
    ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
    {
      variables: {
        baseId,
      },
    },
  );

  // Mutation after form submission
  const [createTransferShipmentMutation, createTransferShipmentMutationState] = useMutation<
    CreateTransferShipmentMutation,
    CreateTransferShipmentMutationVariables
  >(CREATE_SHIPMENT_MUTATION, {
    update(cache, { data: returnedShipment }) {
      cache.modify({
        fields: {
          shipments(existingShipments = []) {
            const newShipmentRef = cache.writeFragment({
              data: returnedShipment?.createShipment,
              fragment: gql`
                fragment NewShipment on Shipment {
                  id
                }
              `,
            });
            return existingShipments.concat(newShipmentRef);
          },
        },
      });
    },
  });

  // Prep data for Form
  const allTransferAgreements = allFormOptions.data?.transferAgreements;

  const currentOrganisationLabel = `${allFormOptions?.data?.base?.organisation?.name} - ${allFormOptions?.data?.base?.name}`;

  const partnerOrgsAgreementData = allTransferAgreements
    ?.filter(
      (agreement) =>
        agreement.sourceOrganisation.id === globalPreferences.selectedOrganisationId?.toString() ||
        (agreement.targetOrganisation.id === globalPreferences.selectedOrganisationId?.toString() &&
          agreement.type === TransferAgreementType.Bidirectional),
    )
    .map(
      (agreement) =>
        ({
          agreementId: agreement.id,
          specialNote: agreement.comment,
          orgId: agreement.targetOrganisation.id,
          orgName: agreement.targetOrganisation.name,
          orgBases: agreement.targetBases,
        } as IOrganisationsAgreementsDataData),
    );

  // Handle Submission
  const onSubmitCreateShipmentForm = (createTransferShipmentData: ITransferShipmentFormData) => {
    // eslint-disable-next-line no-console
    console.log(createTransferShipmentData);
    const agreementId =
      createTransferShipmentData?.partnerOrganisationSelectedBase.data?.agreementId || null;

    if (agreementId === null) {
      triggerError({
        message: "Error while trying to create a new shipment",
      });
    } else {
      createTransferShipmentMutation({
        variables: {
          transferAgreementId: parseInt(agreementId, 10),
          sourceBaseId: parseInt(baseId, 10),
          targetBaseId: parseInt(createTransferShipmentData.partnerOrganisation.value, 10),
        },
      })
        .then((mutationResult) => {
          if (mutationResult.errors) {
            triggerError({
              message: "Error while trying to create a new shipment",
            });
          } else {
            createToast({
              title: `Transfer Shipment ${mutationResult.data?.createShipment?.id}`,
              type: "success",
              message: "Successfully created a new shipment",
            });

            navigate(`/bases/${baseId}/transfers/shipments`);
          }
        })
        .catch((err) => {
          triggerError({
            message: "Error while trying to create a new shipment!",
            statusCode: err.code,
          });
        });
    }
  };

  // Handle Loading State
  if (allFormOptions.loading || createTransferShipmentMutationState.loading) {
    return <APILoadingIndicator />;
  }

  if (
    partnerOrgsAgreementData?.length === 0 ||
    partnerOrgsAgreementData === undefined ||
    allTransferAgreements === undefined
  ) {
    return (
      <Alert status="error">
        <AlertIcon />
        {/* TODO: We need to distinguish the case here between a network error and
         a base without transfer agreements */}
        Could not fetch Organisation and Base data! Please try reloading the page.
      </Alert>
    );
  }

  return (
    <Center>
      <CreateTransferShipment
        currentOrganisationLabel={currentOrganisationLabel}
        partnerOrganisationsAgreementsData={partnerOrgsAgreementData}
        onSubmitCreateTransferShipmentForm={onSubmitCreateShipmentForm}
      />
    </Center>
  );
}

export default CreateShipmentView;
