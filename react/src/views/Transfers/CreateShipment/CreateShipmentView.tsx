import { useCallback, useContext } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useErrorHandling } from "hooks/error-handling";
import { useNotification } from "hooks/hooks";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import {
  AllAcceptedTransferAgreementsQuery,
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  TransferAgreementType,
} from "types/generated/graphql";
import {
  BASE_ORG_FIELDS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  TRANSFER_AGREEMENT_FIELDS_FRAGMENT,
} from "queries/fragments";
import CreateShipment, {
  IOrganisationBaseData,
  ICreateShipmentFormData,
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
  mutation CreateShipment($sourceBaseId: Int!, $targetBaseId: Int!, $transferAgreementId: Int!) {
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

  // variables in URL
  const baseId = useParams<{ baseId: string }>().baseId!;

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
  const currentOrganisationLabel = `${allAcceptedTransferAgreements?.data?.base?.organisation?.name} - ${allAcceptedTransferAgreements?.data?.base?.name}`;
  const currentOrganisationId = globalPreferences.selectedOrganisationId?.toString();
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
            id: agreement.targetOrganisation.id,
            name: agreement.targetOrganisation.name,
            bases: agreement.targetBases,
            agreementId: agreement.id,
          } as IAcceptedTransferAgreementsPartnerData;
        }
        return {
          id: agreement.sourceOrganisation.id,
          name: agreement.sourceOrganisation.name,
          bases: agreement.targetBases,
          agreementId: agreement.id,
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
        } as IOrganisationBaseData),
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
      const agreementIds: Array<string> =
        acceptedTransferAgreementsPartnerData
          ?.filter((org) =>
            org.bases.some((base) => base.id === createShipmentFormData.receivingBase.value),
          )
          .map((org) => org.agreementId) || [];

      if (agreementIds.length === 0) {
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
  if (allAcceptedTransferAgreements.loading) {
    return <APILoadingIndicator />;
  }

  if (
    partnerOrganisationBaseData?.length === 0 ||
    partnerOrganisationBaseData === undefined ||
    allAcceptedTransferAgreements.error
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
      <CreateShipment
        currentOrganisationLabel={currentOrganisationLabel}
        organisationBaseData={partnerOrganisationBaseData}
        onSubmit={onSubmitCreateShipmentForm}
      />
    </Center>
  );
}

export default CreateShipmentView;
