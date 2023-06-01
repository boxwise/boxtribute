import { Button, Flex } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "components/Form/SelectField";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { FaWarehouse } from "react-icons/fa";
import { z } from "zod";
import { ILocationData } from "../BoxReconciliationContainer";

interface IReceiveLocationFormProps {
  allLocations: ILocationData[];
  onLocationSpecified: (locationSpecified: boolean) => void;
  onSubmitReceiveLocationForm: (receiveLocationId: string) => void;
}

// Definitions for form validation with zod

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const ReceiveLocationFormDataSchema = z.object({
  locationId: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a location" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
});

export type IReceiveLocationFormData = z.infer<typeof ReceiveLocationFormDataSchema>;

export function ReceiveLocationForm({
  allLocations,
  onLocationSpecified,
  onSubmitReceiveLocationForm,
}: IReceiveLocationFormProps) {
  const locationsForDropdownGroups = allLocations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  // Form Default Values
  const defaultValues: IReceiveLocationFormData = {
    locationId: { label: "Select Location", value: "" },
  };

  // react-hook-form
  const {
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IReceiveLocationFormData>({
    resolver: zodResolver(ReceiveLocationFormDataSchema),
    defaultValues,
  });

  const locationId = watch("locationId");

  useEffect(() => {
    if (locationId != null) {
      onLocationSpecified(true);
    }
  }, [locationId, onLocationSpecified]);

  return (
    <form onSubmit={() => onSubmitReceiveLocationForm}>
      <Flex direction="column" gap="2">
        <Flex alignContent="center" gap={2} alignItems="center">
          <FaWarehouse size={20} />
          <SelectField
            showError={false}
            showLabel={false}
            fieldId="locationId"
            fieldLabel="Location"
            placeholder="Select Location"
            options={locationsForDropdownGroups}
            errors={errors}
            control={control}
          />
          <BsFillCheckCircleFill color={locationId?.value !== "" ? "#659A7E" : "#fff"} size={18} />
        </Flex>

        <Flex alignContent="center" alignItems="center">
          <Button
            isLoading={isSubmitting}
            type="submit"
            borderRadius="0"
            w="full"
            bgColor="blue.500"
            color="white"
            disabled={isSubmitting || locationId.value === ""}
          >
            Save and Move Instock
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
