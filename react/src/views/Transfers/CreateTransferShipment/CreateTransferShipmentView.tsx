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
import CreateTransferShipment, {
  IOrganisationsAgreementsDataData,
  ITransferShipmentFormData,
} from "./components/CreateTransferShipment";

export const ALL_ORGS_AND_BASES_WITH_TRANSFER_AGREEMENTS_QUERY = gql`
  query AllAcceptedTransferAgreements($baseId: ID!) {
    base(id: $baseId) {
      name
      organisation {
        id
        name
      }
    }

    transferAgreements(states: Accepted) {
      id
      sourceOrganisation {
        id
        name
      }
      sourceBases {
        id
        name
      }
      targetOrganisation {
        id
        name
      }
      targetBases {
        id
        name
      }
      type
      state
      shipments {
        id
        state
      }
      type
      state
      requestedBy {
        id
        name
      }
      validFrom
      validUntil
      validFrom

      comment
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = gql`
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
      id
    }
  }
`;

function CreateTransferShipmentView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  // variables in URL
  const baseId = useParams<{ baseId: string }>().baseId!;

  // Query Data for the Form
  const allFormOptions = useQuery<AllAcceptedTransferAgreementsQuery>(
    ALL_ORGS_AND_BASES_WITH_TRANSFER_AGREEMENTS_QUERY,
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
  >(CREATE_SHIPMENT_MUTATION);

  // Prep data for Form
  const allTransferAgreements = allFormOptions.data?.transferAgreements;

  // eslint-disable-next-line max-len
  const currentOrganisationLabel = `${allFormOptions?.data?.base?.organisation?.name} - ${allFormOptions?.data?.base?.name}`;

  const partnerOrgsAgreementData = allTransferAgreements
    ?.filter(
      (agreement) =>
        agreement.sourceOrganisation.id === globalPreferences.selectedOrganisationId?.toString() &&
        (agreement.type === TransferAgreementType.SendingTo ||
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
    createTransferShipmentMutation({
      variables: {
        transferAgreementId: 1,
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
          message: "Your changes could not be saved!",
          statusCode: err.code,
        });
      });
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

export default CreateTransferShipmentView;
