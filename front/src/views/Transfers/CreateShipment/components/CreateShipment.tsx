import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Stack,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { useNavigate } from "react-router-dom";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { useBaseIdParam } from "hooks/useBaseIdParam";

export interface IBaseData {
  id: string;
  name: string;
}

export interface IOrganisationBaseData {
  id: string;
  name: string;
  bases: IBaseData[];
  comment?: string;
}

// Define schema of the form
const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const shipmentTargetSchema = z.union([z.literal("partners"), z.literal("currentOrg")]);

// Define validation checks on form by defining the form schema
export const ShipmentFormSchema = z.object({
  shipmentTarget: shipmentTargetSchema,
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
  currentOrganisationId: string;
  currentOrganisationLabel: string;
  currentOrganisationBases: IBaseData[];
  organisationBaseData: IOrganisationBaseData[];
  onSubmit: SubmitHandler<ICreateShipmentFormData>;
}

export type ShipmentTarget = z.infer<typeof shipmentTargetSchema>;

function CreateShipment({
  isLoading,
  currentOrganisationId,
  currentOrganisationLabel,
  currentOrganisationBases,
  organisationBaseData,
  onSubmit,
}: ICreateShipmentProps) {
  const navigate = useNavigate();
  const { baseId } = useBaseIdParam();

  // React Hook Form with zod validation
  const {
    handleSubmit,
    control,
    resetField,
    watch,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ICreateShipmentFormData>({
    resolver: zodResolver(ShipmentFormSchema),
  });

  const {
    handleSubmit: handleSubmitIntraOrg,
    control: controlIntraOrg,
    setValue: setValueIntraOrg,
    register: registerIntraOrg,
    formState: { errors: errorsIntraOrg, isSubmitting: isSubmittingIntraOrg },
  } = useForm<ICreateShipmentFormData>({
    resolver: zodResolver(ShipmentFormSchema),
  });

  setValueIntraOrg("receivingOrganisation", {
    label: currentOrganisationLabel,
    value: currentOrganisationId,
  });

  // Prepare options for the organisation field
  const organisationOptions: Array<IDropdownOption> = organisationBaseData?.map((organisation) => ({
    label: organisation.name,
    value: organisation.id,
    comment: organisation.comment,
  }));

  // Prepare options for the organisation field, but for intra-org shipments
  const intraOrganisationOptions = currentOrganisationBases
    .filter((base) => base.id !== baseId) // Don't try to ship to same base as current.
    .map((base) => ({
      value: base.id,
      label: base.name,
    }));

  // selected Option for organisation field
  const receivingOrganisation = watch("receivingOrganisation");

  // Display agreement comment, if any.
  const [agreementNote, setAgreementNote] = useState("");
  // Prepare options for the base field
  const [basesOptions, setBasesOptions] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    if (receivingOrganisation) {
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
        New Shipment
      </Heading>
      <Tabs variant="unstyled">
        <Box border="2px" mb={8}>
          <HStack mb={4} borderBottom="2px" p={2}>
            <SendingIcon />
            <Text fontWeight="bold" fontSize="md">
              SENDING
            </Text>
          </HStack>
          <Center my={4}>
            <Text fontWeight="medium" fontSize="md">
              {currentOrganisationLabel}
            </Text>
          </Center>
        </Box>
        <HStack p={2} border="2px">
          <ReceivingIcon />
          <Text fontWeight="bold" fontSize="md">
            RECEIVING
          </Text>
        </HStack>
        <TabList border="2px" borderTop="none" borderBottom="none">
          <Tab flex={1}>PARTNERS</Tab>
          <Tab flex={1}>{currentOrganisationLabel}</Tab>
        </TabList>
        <TabIndicator mt="-1.5px" height="2px" bg="blue.500" borderRadius="1px" />
        <TabPanels>
          <TabPanel padding={0}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                id="shipmentTarget"
                type="hidden"
                value="partners"
                {...register("shipmentTarget")}
              />
              <Box border="2px" mb={8} borderTop="none" p={2}>
                <SelectField
                  fieldId="receivingOrganisation"
                  fieldLabel="Organisation"
                  placeholder="Please select an organisation"
                  options={organisationOptions}
                  errors={errors}
                  control={control}
                  onChangeProp={(e) => setAgreementNote(e.comment)}
                />
                <SelectField
                  fieldId="receivingBase"
                  fieldLabel="Base"
                  placeholder="Please select a base"
                  errors={errors}
                  control={control}
                  options={basesOptions}
                />
                {agreementNote && (
                  <FormControl>
                    <FormLabel>Note</FormLabel>
                    <Textarea readOnly value={agreementNote} />
                  </FormControl>
                )}
              </Box>
              <Stack spacing={4} mt={8}>
                <Button
                  isLoading={isSubmitting || isLoading}
                  type="submit"
                  borderRadius="0"
                  w="full"
                  variant="solid"
                  backgroundColor="blue.500"
                  color="white"
                >
                  Start New Shipment
                </Button>
                <Button
                  size="md"
                  type="button"
                  borderRadius="0"
                  w="full"
                  variant="outline"
                  onClick={() => navigate(`/bases/${baseId}/transfers/shipments`)}
                >
                  Nevermind
                </Button>
              </Stack>
            </form>
          </TabPanel>
          <TabPanel padding={0}>
            <form onSubmit={handleSubmitIntraOrg(onSubmit)}>
              <input
                {...registerIntraOrg("shipmentTarget")}
                id="shipmentTarget"
                type="hidden"
                value="currentOrg"
              />
              <Box border="2px" mb={8} borderTop="none" p={2}>
                <SelectField
                  fieldId="receivingBase"
                  fieldLabel="Base"
                  placeholder="Please select a base"
                  errors={errorsIntraOrg}
                  control={controlIntraOrg}
                  options={intraOrganisationOptions}
                />
              </Box>
              <Stack spacing={4} mt={8}>
                <Button
                  isLoading={isSubmittingIntraOrg || isLoading}
                  type="submit"
                  borderRadius="0"
                  w="full"
                  variant="solid"
                  backgroundColor="blue.500"
                  color="white"
                >
                  Start New Shipment
                </Button>
                <Button
                  size="md"
                  type="button"
                  borderRadius="0"
                  w="full"
                  variant="outline"
                  onClick={() => navigate(`/bases/${baseId}/transfers/shipments`)}
                >
                  Nevermind
                </Button>
              </Stack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default CreateShipment;
