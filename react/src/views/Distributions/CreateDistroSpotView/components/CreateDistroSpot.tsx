import { Button, Flex, FormLabel, Input, Spacer, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { DistroSpot } from "views/Distributions/DistroSpotsView/components/DistroSpots";

interface CreateDistroSpotProps {
    onSubmitNewDitroSpot: () => void;
  }

const CreateDistroSpot = ({onSubmitNewDitroSpot}: CreateDistroSpotProps) => {
  const { register, handleSubmit, formState: { isSubmitting }} = useForm<DistroSpot>({
    defaultValues: {
      name: "",
      comment: "",
    },
  });
//   const onSubmit = (data) => console.log(data);
  return (
      <Flex>
    <form onSubmit={handleSubmit(onSubmitNewDitroSpot)}>
    <Text fontSize="xl" mb={2}>New Distro Spot</Text>
    <FormLabel fontSize='sm' htmlFor='name'>Name of a Distro Spot:</FormLabel>
      <Input mb={4}
        {...register("name", { required: true })}
        placeholder="Write a name for a Distro Spot"
      />
      <FormLabel fontSize='sm' htmlFor='comment'>Comment:</FormLabel>
      <Input mb={4}
        {...register("comment")}
        placeholder="Comments"
      />
      <FormLabel fontSize='sm' htmlFor='latitude'>Geo Location:</FormLabel>
      <Flex>

      <Input  mb={4} mr={2}
        {...register("geoData.latitude")}
        placeholder="latitude"
      />
      <Spacer />
      <Input  mb={4}
        {...register("geoData.longitude")}
        placeholder="longitude"
      />
      </Flex>

      <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit">
      Submit</Button>
    </form>
    </Flex>
  );
};

export default CreateDistroSpot;
