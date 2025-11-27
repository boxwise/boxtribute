import { Button, Flex, Input, Spacer, Field } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LatitudeSchema, LongitudeSchema } from "views/Distributions/types";

export const CreateDistributionSpotFormDataSchema = z.object({
  name: z.string().min(2),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema, // .or(z.undefined()),
  comment: z.string().nullish(),
});

export type CreateDistributionSpotFormData = z.infer<typeof CreateDistributionSpotFormDataSchema>;

interface CreateDistroSpotProps {
  onSubmitNewDistributionSpot: (distroSpotFormData: CreateDistributionSpotFormData) => void;
  isMutationLoading: boolean;
}

function CreateDistributionSpot({
  onSubmitNewDistributionSpot,
  isMutationLoading,
}: CreateDistroSpotProps) {
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
        <Field.Label fontSize="sm" htmlFor="name">
          Name of the Distribution Spot:
        </Field.Label>
        <Input mb={4} {...register("name")} placeholder="Write a name for a Distro Spot" />
        {errors.name?.message && <p>{errors.name?.message}</p>}
        <Field.Label fontSize="sm" htmlFor="latitude">
          Geo Location:
        </Field.Label>
        <Flex>
          <Input
            mb={4}
            mr={2}
            {...register("latitude", { setValueAs: (v) => (v === "" ? undefined : parseFloat(v)) })}
            placeholder="latitude"
          />
          {errors.latitude?.message && <p>{errors.latitude?.message}</p>}
          <Spacer />
          <Input
            mb={4}
            {...register("longitude", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            placeholder="longitude"
          />
          {errors.longitude?.message && <p>{errors.longitude?.message}</p>}
        </Flex>
        <Field.Label fontSize="sm" htmlFor="comment">
          Comment:
        </Field.Label>
        <Input mb={4} {...register("comment")} placeholder="Comments" />
        <br />
        <br />
        <Button
          disabled={isMutationLoading}
          mt={4}
          colorPalette="teal"
          loading={isMutationLoading}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Flex>
  );
}

export default CreateDistributionSpot;
