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
        <Field.Root id="name">
          <Field.Label fontSize="sm" htmlFor="name">
            Name of the Distribution Spot:
          </Field.Label>
          <Input mb={4} {...register("name")} placeholder="Write a name for a Distro Spot" />
          <Field.ErrorText>{errors.name?.message && errors.name?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root id="latitude-longitude">
          <Field.Label fontSize="sm" htmlFor="latitude">
            Geo Location:
          </Field.Label>
          <Flex>
            <Input
              mb={4}
              mr={2}
              {...register("latitude", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              placeholder="latitude"
            />
            <Field.ErrorText>
              {errors.latitude?.message && errors.latitude?.message}
            </Field.ErrorText>
            <Spacer />
            <Input
              mb={4}
              {...register("longitude", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              placeholder="longitude"
            />
            <Field.ErrorText>
              {errors.longitude?.message && errors.longitude?.message}
            </Field.ErrorText>
          </Flex>
        </Field.Root>
        <Field.Root id="comment">
          <Field.Label fontSize="sm" htmlFor="comment">
            Comment:
          </Field.Label>
          <Input mb={4} {...register("comment")} placeholder="Comments" />
        </Field.Root>
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
