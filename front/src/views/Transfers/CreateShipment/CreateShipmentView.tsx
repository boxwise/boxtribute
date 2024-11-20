import { useCallback, useContext, useEffect } from "react";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import {
  AllAcceptedTransferAgreementsQuery,
  AllBasesOfCurrentOrgQuery,
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  TransferAgreementType,
} from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  TRANSFER_AGREEMENT_FIELDS_FRAGMENT,
} from "queries/fragments";
import { MobileBreadcrumbButton } from "components/BreadcrumbNavigation";
import CreateShipment, {
  IOrganisationBaseData,
  ICreateShipmentFormData,
} from "./components/CreateShipment";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";

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

export const ALL_BASES_OF_CURRENT_ORG_QUERY = gql`
  query AllBasesOfCurrentOrg($orgId: ID!) {
    organisation(id: $orgId) {
      id
      name
      bases {
        id
        name
      }
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  mutation CreateShipment($sourceBaseId: Int!, $targetBaseId: Int!, $transferAgreementId: Int) {
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

interface IAcceptedTransferAgreementsPartnerData extends IOrganisationBaseData {
  agreementId: string;
}

function CreateShipmentView() {
  // Basics
  const navigate = useNavigate();
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const { isLoading: isGlobalStateLoading } = useLoadAndSetGlobalPreferences();

  // variables in URL
  const { baseId } = useBaseIdParam();

  // Query Data for the Form
  const allAcceptedTransferAgreements = useQuery<AllAcceptedTransferAgreementsQuery>(
    ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
    {
      variables: {
        baseId,
      },
    },
  );

  // Mutation after form submission
  const [createShipmentMutation, createShipmentMutationState] = useMutation<
    CreateShipmentMutation,
    CreateShipmentMutationVariables
  >(CREATE_SHIPMENT_MUTATION, {
    update(cache, { data: returnedShipment }) {
      if (returnedShipment?.createShipment) {
        cache.modify({
          fields: {
            shipments(existingShipments = []) {
              const newShipmentRef = cache.writeFragment({
                data: returnedShipment.createShipment,
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
      }
    },
  });

  // Prep data for Form
  const currentBase = allAcceptedTransferAgreements?.data?.base;
  const currentOrganisationName = currentBase?.organisation?.name;
  const currentOrganisationBase = currentBase?.name;
  const currentOrganisationId = globalPreferences.organisation?.id;

  const [
    runAllBasesOfCurrentOrg,
    {
      loading: allBasesOfCurrentOrgLoading,
      error: allBasesOfCurrentOrgError,
      data: AllBasesOfCurrentOrg,
    },
  ] = useLazyQuery<AllBasesOfCurrentOrgQuery>(ALL_BASES_OF_CURRENT_ORG_QUERY, {
    variables: {
      orgId: currentOrganisationId,
    },
  });

  useEffect(() => {
    if (currentOrganisationId) runAllBasesOfCurrentOrg();
  }, [runAllBasesOfCurrentOrg, currentOrganisationId]);

  const currentOrganisationBases = AllBasesOfCurrentOrg?.organisation?.bases;

  const acceptedTransferAgreementsPartnerData =
    allAcceptedTransferAgreements.data?.transferAgreements
      ?.filter(
        // Either we are the sourceOrg of the agreement or the targetOrg in combination with a bidirectional agreement
        (agreement) =>
          agreement.sourceOrganisation.id === currentOrganisationId ||
          (agreement.targetOrganisation.id === currentOrganisationId &&
            agreement.type === TransferAgreementType.Bidirectional),
      )
      .map((agreement) => {
        // transform the agreement data to organisation base data
        if (
          agreement.targetOrganisation.id === currentOrganisationId &&
          agreement.type === TransferAgreementType.Bidirectional
        ) {
          return {
            id: agreement.sourceOrganisation.id,
            name: agreement.sourceOrganisation.name,
            bases: agreement.sourceBases,
            agreementId: agreement.id,
            agreementComment: agreement.comment,
          } as IAcceptedTransferAgreementsPartnerData;
        }
        return {
          id: agreement.targetOrganisation.id,
          name: agreement.targetOrganisation.name,
          bases: agreement.targetBases,
          agreementId: agreement.id,
          agreementComment: agreement.comment,
        } as IAcceptedTransferAgreementsPartnerData;
      });

  const partnerOrganisationBaseData = acceptedTransferAgreementsPartnerData
    ?.map(
      (agreement) =>
        // transform the agreement data to organisation base data
        ({
          id: agreement.id,
          name: agreement.name,
          bases: agreement.bases,
          agreement: agreement.comment,
        }) as IOrganisationBaseData,
    )
    .reduce((accumulator, currentOrg) => {
      // Merge options. If there are multiple transfer agreements this step is necessary
      const existingOrganisation = accumulator.find((org) => org.id === currentOrg.id);
      if (existingOrganisation) {
        existingOrganisation.bases.push(
          ...currentOrg.bases.filter(
            (base) => !existingOrganisation.bases.some((b) => b.id === base.id),
          ),
        );
      } else {
        accumulator.push(currentOrg);
      }
      return accumulator;
    }, [] as IOrganisationBaseData[]);

  // Handle Submission
  const onSubmitCreateShipmentForm = useCallback(
    (createShipmentFormData: ICreateShipmentFormData) => {
      // Find the possible agreement Ids for the partner base
      // Or ignore this and return an empty array if this is an intra-org shipment between bases of the same organization.
      const agreementIds: Array<string> =
        createShipmentFormData.shipmentTarget === "currentOrg"
          ? []
          : acceptedTransferAgreementsPartnerData
              ?.filter((org) =>
                org.bases.some((base) => base.id === createShipmentFormData.receivingBase.value),
              )
              .map((org) => org.agreementId) || [];

      if (agreementIds.length === 0 && createShipmentFormData.shipmentTarget === "partners") {
        triggerError({
          message: "Error while trying to create a new shipment",
        });
      } else {
        createShipmentMutation({
          variables: {
            // This is just a hack since it is possible that multiple agreements exist for the same base
            transferAgreementId: parseInt(agreementIds[0], 10),
            sourceBaseId: parseInt(baseId, 10),
            targetBaseId: parseInt(createShipmentFormData.receivingBase.value, 10),
          },
        })
          .then((mutationResult) => {
            if (mutationResult.errors) {
              triggerError({
                message: "Error while trying to create a new shipment!",
              });
            } else {
              const shipmentId = mutationResult.data?.createShipment?.id;
              createToast({
                title: `Transfer Shipment ${shipmentId}`,
                type: "success",
                message: "Successfully created a new shipment",
              });

              navigate(`/bases/${baseId}/transfers/shipments/${shipmentId}`);
            }
          })
          .catch((err) => {
            triggerError({
              message: "Error while trying to create a new shipment!",
              statusCode: err.code,
            });
          });
      }
    },
    [
      acceptedTransferAgreementsPartnerData,
      baseId,
      createShipmentMutation,
      createToast,
      triggerError,
      navigate,
    ],
  );

  // Handle Loading State
  if (allBasesOfCurrentOrgLoading || allAcceptedTransferAgreements.loading || isGlobalStateLoading)
    return <APILoadingIndicator />;

  const noAcceptedAgreements = allAcceptedTransferAgreements.data?.transferAgreements.length === 0;
  const noPartnerOrgBaseData =
    !partnerOrganisationBaseData || partnerOrganisationBaseData.length === 0;

  if (allBasesOfCurrentOrgError || allAcceptedTransferAgreements.error)
    return (
      <Alert status="error">
        <AlertIcon />
        Could not fetch Organisation and Base data! Please try reloading the page.
      </Alert>
    );

  return (
    <>
      <MobileBreadcrumbButton label="Back to Manage Shipments" linkPath=".." />
      <Center>
        <CreateShipment
          isLoading={createShipmentMutationState.loading}
          currentOrganisationId={currentOrganisationId || ""}
          currentOrganisationName={currentOrganisationName || ""}
          currentOrganisationBase={currentOrganisationBase || ""}
          currentOrganisationBases={currentOrganisationBases || []}
          organisationBaseData={partnerOrganisationBaseData || []}
          onSubmit={onSubmitCreateShipmentForm}
          noAcceptedAgreements={noAcceptedAgreements || noPartnerOrgBaseData}
        />
      </Center>
    </>
  );
}

export default CreateShipmentView;
