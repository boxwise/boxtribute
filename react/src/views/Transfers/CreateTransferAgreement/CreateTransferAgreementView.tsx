import { useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  AllOrganisationsAndBasesQuery,
  CreateTransferAgreementMutation,
  CreateTransferAgreementMutationVariables,
  TransferAgreementType,
} from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import CreateTransferAgreement, {
  IBasesForOrganisationData,
  ITransferAgreementFormData,
} from "./components/CreateTransferAgreement";

export const ALL_ORGS_AND_BASES_QUERY = gql`
  query AllOrganisationsAndBases {
    organisations {
      id
      name
      bases {
        id
        name
      }
    }
  }
`;

export const CREATE_AGREEMENT_MUTATION = gql`
  mutation CreateTransferAgreement(
    $sourceOrganisationId: Int!
    $targetOrganisationId: Int!
    $type: TransferAgreementType!
    $validFrom: Date
    $validUntil: Date
    $timezone: String
    $sourceBaseIds: [Int!]
    $targetBaseIds: [Int!]
    $comment: String
  ) {
    createTransferAgreement(
      creationInput: {
        sourceOrganisationId: $sourceOrganisationId
        targetOrganisationId: $targetOrganisationId
        type: $type
        validFrom: $validFrom
        validUntil: $validUntil
        timezone: $timezone
        sourceBaseIds: $sourceBaseIds
        targetBaseIds: $targetBaseIds
        comment: $comment
      }
    ) {
      id
    }
  }
`;

function CreateTransferAgreementView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);

  // variables in URL
  const baseId = useParams<{ baseId: string }>().baseId!;

  // Query Data for the Form
  const allFormOptions = useQuery<AllOrganisationsAndBasesQuery>(ALL_ORGS_AND_BASES_QUERY, {});

  // Mutation after form submission
  const [createTransferAgreementMutation, createTransferAgreementMutationState] = useMutation<
    CreateTransferAgreementMutation,
    CreateTransferAgreementMutationVariables
  >(CREATE_AGREEMENT_MUTATION);

  // Prep data for Form
  const allOrgsAndTheirBases = allFormOptions.data?.organisations;

  // When boxtribute god logs in without predifiend organisation id, use organisation id 1
  const userCurrentOrganisatinId = globalPreferences.selectedOrganisationId?.toString() ?? "1";

  const currentOrganisation = allOrgsAndTheirBases?.find(
    (organisation) => organisation.id === userCurrentOrganisatinId,
  );

  // Filter bases where the user is not authorized
  const currentOrganisationAuthorizedBases = {
    ...currentOrganisation,
    bases: globalPreferences?.availableBases,
  } as IBasesForOrganisationData;

  const partnerOrganisationsWithTheirBasesData = allOrgsAndTheirBases?.filter(
    (organisation) => organisation.id !== globalPreferences.selectedOrganisationId?.toString(),
  );

  // Handle Submission
  const onSubmitCreateAgreementForm = (createTransferAgreementData: ITransferAgreementFormData) => {
    const currentOrgBaseIds = createTransferAgreementData?.currentOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    const partnerBaseIds = createTransferAgreementData?.partnerOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    let transferType: TransferAgreementType;
    switch (createTransferAgreementData.transferType) {
      case "Sending to":
        transferType = TransferAgreementType.SendingTo;
        break;
      case "Receiving from":
        transferType = TransferAgreementType.ReceivingFrom;
        break;
      default:
        transferType = TransferAgreementType.Bidirectional;
        break;
    }

    createTransferAgreementMutation({
      variables: {
        sourceOrganisationId: parseInt(userCurrentOrganisatinId, 10),
        targetOrganisationId: parseInt(createTransferAgreementData.partnerOrganisation.value, 10),
        type: transferType,
        validFrom: createTransferAgreementData?.validFrom,
        validUntil: createTransferAgreementData?.validUntil,
        sourceBaseIds: currentOrgBaseIds,
        targetBaseIds: partnerBaseIds,
        comment: createTransferAgreementData.comment,
      },
    })
      .then((mutationResult) => {
        if (mutationResult.errors) {
          triggerError({
            message: "Error while trying to create transfer agreement",
          });
        } else {
          createToast({
            title: `Transfer Agreement ${mutationResult.data?.createTransferAgreement?.id}`,
            type: "success",
            message: "Successfully created a transfer agreement",
          });

          navigate(`/bases/${baseId}/transfers/agreements`);
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
  if (allFormOptions.loading || createTransferAgreementMutationState.loading) {
    return <APILoadingIndicator />;
  }

  if (allOrgsAndTheirBases === undefined) {
    return (
      <Alert status="error">
        <AlertIcon />
        Could not fetch Organisation and Base data! Please try reloading the page.
      </Alert>
    );
  }

  return (
    <Center>
      <CreateTransferAgreement
        currentOrganisation={currentOrganisationAuthorizedBases}
        partnerOrganisationsWithTheirBasesData={
          partnerOrganisationsWithTheirBasesData as unknown as IBasesForOrganisationData[]
        }
        onSubmitCreateTransferAgreementForm={onSubmitCreateAgreementForm}
      />
    </Center>
  );
}

export default CreateTransferAgreementView;
