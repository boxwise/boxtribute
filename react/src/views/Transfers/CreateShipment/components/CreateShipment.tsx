import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Divider,
  Heading,
  HStack,
  List,
  ListItem,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { useNavigate } from "react-router-dom";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";

export interface IBaseData {
  id: string;
  name: string;
}

export interface IOrganisationBaseData {
  id: string;
  name: string;
  bases: IBaseData[];
}

// Define schema of the form
const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

// Define validation checks on form by defining the form schema
export const ShipmentFormSchema = z.object({
  receivingOrganisation: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a partner organisation" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  receivingBase: singleSelectOptionSchema
    .nullable()
    .refine(Boolean, { message: "Please select a partner base" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
});
export type ICreateShipmentFormData = z.infer<typeof ShipmentFormSchema>;

export interface ICreateShipmentProps {
  isLoading: boolean;
  currentOrganisationLabel: string;
  organisationBaseData: IOrganisationBaseData[];
  onSubmit: SubmitHandler<ICreateShipmentFormData>;
}

function CreateShipment({
  isLoading,
  currentOrganisationLabel,
  organisationBaseData,
  onSubmit,
}: ICreateShipmentProps) {
  const navigate = useNavigate();
  const { globalPreferences } = useContext(GlobalPreferencesContext);
  const baseId = globalPreferences.selectedBaseId!;

  // React Hook Form with zod validation
  const {
    handleSubmit,
    control,
    resetField,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ICreateShipmentFormData>({
    resolver: zodResolver(ShipmentFormSchema),
  });

  // Prepare options for the organisation field
  const organisationOptions: Array<IDropdownOption> = organisationBaseData?.map((organisation) => ({
    label: organisation.name,
    value: organisation.id,
  }));

  // selected Option for organisation field
  const receivingOrganisation = watch("receivingOrganisation");

  // Prepare options for the base field
  const [basesOptions, setBasesOptions] = useState<IDropdownOption[]>([]);
  useEffect(() => {
    if (receivingOrganisation != null) {
      const basesForSelectedOrganisation = organisationBaseData.find(
        (organisation) => organisation.id === receivingOrganisation.value,
      );

      setBasesOptions(
        basesForSelectedOrganisation?.bases?.map((base) => ({
          label: base.name,
          value: base.id,
        })) || [],
      );

      resetField("receivingBase");
      // Put a default value for partnerOrganisationSelectedBases when there's only one option
      if (basesForSelectedOrganisation?.bases.length === 1) {
        setValue("receivingBase", {
          label: basesForSelectedOrganisation?.bases[0].name,
          value: basesForSelectedOrganisation?.bases[0].id,
        });
      }
    }
  }, [receivingOrganisation, resetField, setValue, organisationBaseData]);

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontWeight="bold" mb={8} as="h1">
        Start New Shipment
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <List spacing={2}>
          <ListItem>
            <HStack mb={4}>
              <SendingIcon />
              <Text fontWeight="bold" fontSize="md">
                {" "}
                SENDING
              </Text>
            </HStack>
          </ListItem>
          <ListItem>
            <Center>
              <Text fontWeight="medium" fontSize="md">
                {currentOrganisationLabel}
              </Text>
            </Center>
          </ListItem>
        </List>
        <Spacer mb={8} />
        <Divider size="2" borderColor="black" />
        <Spacer mb={8} />
        <List spacing={2}>
          <ListItem>
            <HStack mb={4}>
              <ReceivingIcon />
              <Text fontWeight="bold" fontSize="md">
                {" "}
                RECEIVING
              </Text>
            </HStack>
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="receivingOrganisation"
              fieldLabel="Organisation"
              placeholder="Please select an organisation"
              options={organisationOptions}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="receivingBase"
              fieldLabel="Base"
              placeholder="Please select a base"
              errors={errors}
              control={control}
              options={basesOptions}
            />
          </ListItem>
        </List>

        <Stack spacing={4}>
          <ButtonGroup gap="4">
            <Button
              mt={10}
              size="md"
              type="button"
              borderRadius="0"
              w="full"
              variant="outline"
              onClick={() => navigate(`/bases/${baseId}/transfers/shipments`)}
            >
              Cancel
            </Button>

            <Button
              mt={10}
              isLoading={isSubmitting || isLoading}
              type="submit"
              borderRadius="0"
              w="full"
              variant="solid"
              backgroundColor="blue.500"
              color="white"
            >
              Start
            </Button>
          </ButtonGroup>
        </Stack>
      </form>
    </Box>
  );
}

export default CreateShipment;
