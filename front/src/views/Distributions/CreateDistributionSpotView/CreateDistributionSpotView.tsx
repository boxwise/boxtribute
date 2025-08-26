import { useMutation } from "@apollo/client/react";
import { graphql } from "../../../../../graphql/graphql";
import { Center, Heading, useToast, VStack } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { DISTRO_SPOTS_FOR_BASE_ID } from "../queries";
import CreateDistributionSpot, {
  CreateDistributionSpotFormData,
} from "./components/CreateDistributionSpot";

export const CREATE_NEW_DISTRIBUTION_SPOT_MUTATION = graphql(`
  mutation CreateDistributionSpot(
    $baseId: Int!
    $name: String!
    $comment: String!
    $latitude: Float
    $longitude: Float
  ) {
    createDistributionSpot(
      creationInput: {
        baseId: $baseId
        name: $name
        comment: $comment
        latitude: $latitude
        longitude: $longitude
      }
    ) {
      id
    }
  }
`);

const CreateDistributionSpotView = () => {
  const [createDistributionSpot, createDistributionSpotState] = useMutation(
    CREATE_NEW_DISTRIBUTION_SPOT_MUTATION,
  );

  const baseId = useParams<{ baseId: string }>().baseId!;
  const navigate = useNavigate();
  const toast = useToast();

  const showErrorToast = () =>
    toast({
      title: "Error",
      description: "Distribution Spot couldn't be created",
      status: "error",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });

  const onSubmitNewDitroSpot = (distroSpot: CreateDistributionSpotFormData) => {
    createDistributionSpot({
      variables: {
        baseId: parseInt(baseId),
        name: distroSpot.name,
        // TODO: make comment optional in GraphQL schema
        comment: distroSpot.comment || "",
        latitude: distroSpot.latitude,
        longitude: distroSpot.longitude,
      },
      refetchQueries: [
        {
          query: DISTRO_SPOTS_FOR_BASE_ID,
          variables: {
            baseId: baseId,
          },
        },
      ],
    })
      .then((mutationResult) => {
        const distributionSpotId = mutationResult.data?.createDistributionSpot?.id;
        if (distributionSpotId === null || mutationResult.error) {
          showErrorToast();
        }
        navigate(`/bases/${baseId}/distributions/spots`);
      })
      .catch((error) => {
        showErrorToast();
        console.error(error);
      });
  };

  return (
    <Center>
      <VStack>
        <Heading>Create new Distribution Spot</Heading>
        {!createDistributionSpotState.error && (
          <CreateDistributionSpot
            onSubmitNewDistributionSpot={onSubmitNewDitroSpot}
            isMutationLoading={createDistributionSpotState.loading}
          />
        )}
        {createDistributionSpotState.error && <p>Error</p>}
      </VStack>
    </Center>
  );
};

export default CreateDistributionSpotView;
