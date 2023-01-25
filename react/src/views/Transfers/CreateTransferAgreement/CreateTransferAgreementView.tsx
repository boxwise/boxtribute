import { useEffect, useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useErrorHandling } from "utils/error-handling";
import { useNotification } from "utils/hooks";
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

  const currentOrganisation = allOrgsAndTheirBases?.find(
    (organisation) => organisation.id === globalPreferences.selectedOrganisationId?.toString(),
  );

  const partnerOrganisationsWithTheirBasesData = allOrgsAndTheirBases?.filter(
    (organisation) => organisation.id !== globalPreferences.selectedOrganisationId?.toString(),
  );

  // check data for form
  useEffect(() => {
    if (!allFormOptions.loading) {
      if (allOrgsAndTheirBases === undefined) {
        triggerError({
          message: "No partner organisation are available!",
        });
      }
    }
  }, [triggerError, allFormOptions.loading, allOrgsAndTheirBases]);

  // Handle Submission
  const onSubmitCreateAgreementForm = (createTransferAgreementData: ITransferAgreementFormData) => {
    const currentOrgBaseIds = createTransferAgreementData?.currentOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    const partnerBaseIds = createTransferAgreementData?.partnerOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    let sourceOrganisationId;
    let targetOrganisationId;
    let targetBaseIds;
    let sourceBaseIds;
    let transferType: TransferAgreementType;

    switch (createTransferAgreementData.transferType) {
      case "Sending to":
        sourceOrganisationId = globalPreferences?.selectedOrganisationId;
        sourceBaseIds = currentOrgBaseIds;
        targetOrganisationId = createTransferAgreementData.partnerOrganisation.value;
        targetBaseIds = partnerBaseIds;
        transferType = TransferAgreementType.Unidirectional;
        break;
      case "Receiving from":
        targetOrganisationId = globalPreferences?.selectedOrganisationId;
        targetBaseIds = currentOrgBaseIds;
        sourceOrganisationId = createTransferAgreementData.partnerOrganisation.value;
        sourceBaseIds = partnerBaseIds;
        transferType = TransferAgreementType.Unidirectional;
        break;
      default:
        sourceOrganisationId = globalPreferences?.selectedOrganisationId;
        sourceBaseIds = currentOrgBaseIds;
        targetOrganisationId = createTransferAgreementData.partnerOrganisation.value;
        targetBaseIds = partnerBaseIds;
        transferType = TransferAgreementType.Bidirectional;
        break;
    }

    createTransferAgreementMutation({
      variables: {
        sourceOrganisationId: parseInt(sourceOrganisationId, 10),
        targetOrganisationId: parseInt(targetOrganisationId, 10),
        type: transferType,
        validFrom: createTransferAgreementData?.validFrom,
        validUntil: createTransferAgreementData?.validUntil,
        sourceBaseIds,
        targetBaseIds,
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

  if (allOrgsAndTheirBases !== undefined) {
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
        currentOrganisation={currentOrganisation as IBasesForOrganisationData}
        partnerOrganisationsWithTheirBasesData={
          partnerOrganisationsWithTheirBasesData as unknown as IBasesForOrganisationData[]
        }
        onSubmitCreateTransferAgreementForm={onSubmitCreateAgreementForm}
      />
    </Center>
  );
}

export default CreateTransferAgreementView;
