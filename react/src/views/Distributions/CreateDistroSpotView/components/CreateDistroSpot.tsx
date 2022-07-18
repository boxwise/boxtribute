import { Button, Flex, FormLabel, Input, Spacer, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
interface CreateDistroSpotProps {
  onSubmitNewDistributionSpot: (distroSpotFormData: CreateDistroSpotFormData) => void;
  isMutationLoading: boolean;
}

export interface CreateDistroSpotFormData {
  id: string;
  name: string;
  geoData?: {
    latitude: string;
    longitude: string;
  };
  comment?: string;
}

const CreateDistroSpot = ({
  onSubmitNewDistributionSpot,
  isMutationLoading
}: CreateDistroSpotProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDistroSpotFormData>({
    defaultValues: {
      name: "",
      comment: "",
      geoData: {
        latitude: "0.0",
        longitude: "0.0",
      },
    },
  });
  //   const onSubmit = (data) => console.log(data);
  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmitNewDistributionSpot)}>
        {/* <Text fontSize="xl" mb={2}>
          New Distro Spot
        </Text> */}
        <FormLabel fontSize="sm" htmlFor="name">
          Name of the Distribution Spot:
        </FormLabel>
        {errors.name?.message && <p>{errors.name?.message}</p>}

        <Input
          mb={4}
          {...register("name", { required: true })}
          placeholder="Write a name for a Distro Spot"
        />
        <FormLabel fontSize="sm" htmlFor="latitude">
          Geo Location:
        </FormLabel>
        <Flex>
          <Input
            mb={4}
            mr={2}
            {...register("geoData.latitude")}
            placeholder="latitude"
          />
          <Spacer />
          <Input
            mb={4}
            {...register("geoData.longitude")}
            placeholder="longitude"
          />
        </Flex>
        <FormLabel fontSize="sm" htmlFor="comment">
          Comment:
        </FormLabel>
        <Input mb={4} {...register("comment")} placeholder="Comments" />
        <br />
        isMutationLoading: {JSON.stringify(isMutationLoading)}
        <br />
        <Button
          disabled={isMutationLoading}
          mt={4}
          colorScheme="teal"
          isLoading={isMutationLoading}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default CreateDistroSpot;
