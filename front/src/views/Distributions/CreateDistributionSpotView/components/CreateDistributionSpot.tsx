import { Button, Flex, FormLabel, Input, Spacer } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { LatitudeSchema, LongitudeSchema } from "views/Distributions/types";

export const CreateDistributionSpotFormDataSchema = z.object({
  name: z.string().min(2),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,//.or(z.undefined()),
  comment: z.string().nullish()
});

export type CreateDistributionSpotFormData = z.infer<typeof CreateDistributionSpotFormDataSchema>;


interface CreateDistroSpotProps {
  onSubmitNewDistributionSpot: (distroSpotFormData: CreateDistributionSpotFormData) => void;
  isMutationLoading: boolean;
}

const CreateDistributionSpot = ({
  onSubmitNewDistributionSpot,
  isMutationLoading
}: CreateDistroSpotProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDistributionSpotFormData>({
    resolver: zodResolver(CreateDistributionSpotFormDataSchema),
  });
  return (
    <Flex>
      <form onSubmit={handleSubmit(onSubmitNewDistributionSpot)}>
        <FormLabel fontSize="sm" htmlFor="name">
          Name of the Distribution Spot:
        </FormLabel>
        <Input
          mb={4}
          {...register("name")}
          placeholder="Write a name for a Distro Spot"
        />
        {errors.name?.message && <p>{errors.name?.message}</p>}
        <FormLabel fontSize="sm" htmlFor="latitude">
          Geo Location:
        </FormLabel>
        <Flex>
          <Input
            mb={4}
            mr={2}
            {...register("latitude", { setValueAs: (v) => v === "" ? undefined : parseFloat(v), })}
            placeholder="latitude"
          />
        {errors.latitude?.message && <p>{errors.latitude?.message}</p>}
          <Spacer />
          <Input
            mb={4}
            {...register("longitude", { setValueAs: (v) => v === "" ? undefined : parseFloat(v), })}

            placeholder="longitude"
          />
        {errors.longitude?.message && <p>{errors.longitude?.message}</p>}
        </Flex>
        <FormLabel fontSize="sm" htmlFor="comment">
          Comment:
        </FormLabel>
        <Input mb={4} {...register("comment")} placeholder="Comments" />
        <br />
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

export default CreateDistributionSpot;
