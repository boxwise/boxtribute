import { useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Box, Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate } from "react-router-dom";
import { TRANSFER_AGREEMENT_FIELDS_FRAGMENT } from "queries/fragments";
import {
  AllOrganisationsAndBasesQuery,
  CreateTransferAgreementMutation,
  CreateTransferAgreementMutationVariables,
  TransferAgreementType,
} from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import CreateTransferAgreement, {
  IBasesForOrganisationData,
  ITransferAgreementFormData,
} from "./components/CreateTransferAgreement";
import { ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY } from "../CreateShipment/CreateShipmentView";
import { IAcceptedTransferAgreement } from "../TransferAgreementOverview/TransferAgreementOverviewView";

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
  ${TRANSFER_AGREEMENT_FIELDS_FRAGMENT}
  mutation CreateTransferAgreement(
    $initiatingOrganisationId: Int!
    $partnerOrganisationId: Int!
    $type: TransferAgreementType!
    $validFrom: Date
    $validUntil: Date
    $initiatingOrganisationBaseIds: [Int!]!
    $partnerOrganisationBaseIds: [Int!]
    $comment: String
  ) {
    createTransferAgreement(
      creationInput: {
        initiatingOrganisationId: $initiatingOrganisationId
        partnerOrganisationId: $partnerOrganisationId
        type: $type
        validFrom: $validFrom
        validUntil: $validUntil
        initiatingOrganisationBaseIds: $initiatingOrganisationBaseIds
        partnerOrganisationBaseIds: $partnerOrganisationBaseIds
        comment: $comment
      }
    ) {
      ...TransferAgreementFields
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
  const baseId = globalPreferences.selectedBase?.id!;

  // Query Data for the Form
  const allFormOptions = useQuery<AllOrganisationsAndBasesQuery>(ALL_ORGS_AND_BASES_QUERY, {});

  // Mutation after form submission
  const [createTransferAgreementMutation, createTransferAgreementMutationState] = useMutation<
    CreateTransferAgreementMutation,
    CreateTransferAgreementMutationVariables
  >(CREATE_AGREEMENT_MUTATION, {
    update(cache, { data: returnedTransferAgreement }) {
      if (returnedTransferAgreement?.createTransferAgreement) {
        cache.modify({
          fields: {
            transferAgreements(existingTransferAgreements = []) {
              const newTransferAgreementRef = cache.writeFragment({
                data: returnedTransferAgreement.createTransferAgreement,
                fragment: gql`
                  fragment NewTransferAgreement on TransferAgreement {
                    id
                    type
                    state
                  }
                `,
              });
              return existingTransferAgreements.concat(newTransferAgreementRef);
            },
          },
        });

        const createdTransferAgreementId = returnedTransferAgreement?.createTransferAgreement.id;

        const existingAcceptedTransferAgreementsData = cache.readQuery<IAcceptedTransferAgreement>({
          query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
          variables: { baseId },
        });

        const index = existingAcceptedTransferAgreementsData?.transferAgreements.findIndex(
          (a) => a.id === createdTransferAgreementId,
        );

        if (index !== undefined && index > -1) {
          existingAcceptedTransferAgreementsData?.transferAgreements.splice(index, 1);

          cache.writeQuery({
            query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
            variables: {
              variables: { baseId },
            },
            data: {
              transferAgreements: existingAcceptedTransferAgreementsData?.transferAgreements,
            },
          });
        }
      }
    },
  });

  // Prep data for Form
  const allOrgsAndTheirBases = allFormOptions.data?.organisations;

  // When boxtribute god logs in without predefined organisation id, use organisation id 1
  const userCurrentOrganisationId = globalPreferences.organisation?.id ?? "1";

  const currentOrganisation = allOrgsAndTheirBases?.find(
    (organisation) => organisation.id === userCurrentOrganisationId,
  );

  // Filter bases where the user is not authorized
  const currentOrganisationAuthorizedBases = {
    ...currentOrganisation,
    bases: globalPreferences?.availableBases,
  } as IBasesForOrganisationData;

  const partnerOrganisationsWithTheirBasesData = allOrgsAndTheirBases?.filter(
    (organisation) => organisation.id !== globalPreferences.organisation?.id,
  );

  // Handle Submission
  const onSubmitCreateAgreementForm = (createTransferAgreementData: ITransferAgreementFormData) => {
    const currentOrgBaseIds = createTransferAgreementData?.currentOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    const partnerBaseIds = createTransferAgreementData?.partnerOrganisationSelectedBases?.map(
      (base) => parseInt(base.value, 10),
    );

    createTransferAgreementMutation({
      variables: {
        initiatingOrganisationId: parseInt(userCurrentOrganisationId, 10),
        partnerOrganisationId: parseInt(createTransferAgreementData.partnerOrganisation.value, 10),
        type: TransferAgreementType.Bidirectional,
        validFrom: createTransferAgreementData?.validFrom,
        validUntil: createTransferAgreementData?.validUntil,
        initiatingOrganisationBaseIds: currentOrgBaseIds,
        partnerOrganisationBaseIds: partnerBaseIds,
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
    <>
      <MobileBreadcrumbButton label="Back to Manage Agreements" linkPath="/transfers/agreements" />
      {createTransferAgreementMutationState.error &&
        createTransferAgreementMutationState.error.graphQLErrors.some(
          (error: any) =>
            error.extensions?.code === "BAD_USER_INPUT" &&
            error.extensions?.description.includes("An identical agreement already exists"),
        ) && (
          <Box mx={1} my={1}>
            {" "}
            <Alert status="error">
              <AlertIcon />
              Can&rsquo;t create agreement, an active identical agreement exists.
            </Alert>
          </Box>
        )}
      <Center>
        <CreateTransferAgreement
          currentOrganisation={currentOrganisationAuthorizedBases}
          partnerOrganisationsWithTheirBasesData={
            partnerOrganisationsWithTheirBasesData as unknown as IBasesForOrganisationData[]
          }
          onSubmitCreateTransferAgreementForm={onSubmitCreateAgreementForm}
        />
      </Center>
    </>
  );
}

export default CreateTransferAgreementView;
