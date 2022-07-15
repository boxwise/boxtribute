import { Button, Flex, FormLabel, Input, Spacer, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
interface CreateDistroSpotProps {
  onSubmitNewDitroSpot: (distroSpotFormData: CreateDistroSpotFormData) => void;
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
  onSubmitNewDitroSpot: onSubmitNewDistroSpot,
}: CreateDistroSpotProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
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
      <form onSubmit={handleSubmit(onSubmitNewDistroSpot)}>
        <Text fontSize="xl" mb={2}>
          New Distro Spot
        </Text>
        <FormLabel fontSize="sm" htmlFor="name">
          Name of a Distro Spot:
        </FormLabel>
        <Input
          mb={4}
          {...register("name", { required: true })}
          placeholder="Write a name for a Distro Spot"
        />
        <FormLabel fontSize="sm" htmlFor="comment">
          Comment:
        </FormLabel>
        <Input mb={4} {...register("comment")} placeholder="Comments" />
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

        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default CreateDistroSpot;
