import { gql, useMutation } from "@apollo/client";
import { Center, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import { DistroSpot } from "../types";
import CreateDistroSpot, {
  CreateDistroSpotFormData,
} from "./components/CreateDistroSpot";
import {
  CreateDistributionSpotMutation,
  CreateDistributionSpotMutationVariables,
} from "../../../types/generated/graphql";
import { useParams } from "react-router-dom";

export const CREATE_NEW_DISTRIBUTION_SPOT_MUTATION = gql`
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
`;

const CreateDistributionSpotView = () => {
  const [createDistributionSpot, createDistributionSpotState] = useMutation<
    CreateDistributionSpotMutation,
    CreateDistributionSpotMutationVariables
  >(CREATE_NEW_DISTRIBUTION_SPOT_MUTATION);

  const baseId = useParams<{ baseId: string }>().baseId!;

  const onSubmitNewDitroSpot = (distroSpot: CreateDistroSpotFormData) => {
    createDistributionSpot({
      variables: {
        baseId: parseInt(baseId),
        name: distroSpot.name,
        // TODO: make comment optional in GraphQL schema
        comment: distroSpot.comment || "",
        latitude: parseFloat(distroSpot.geoData?.latitude || "0.0"),
        longitude: parseFloat(distroSpot.geoData?.longitude || "0.0"),
      },
    })
      .then(() => {
        console.log("Distribution spot created");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Center>
      <VStack>
        <Heading>Create new Distribution Spot</Heading>
        <CreateDistroSpot onSubmitNewDitroSpot={onSubmitNewDitroSpot} />
      </VStack>
    </Center>
  );
};

export default CreateDistributionSpotView;
