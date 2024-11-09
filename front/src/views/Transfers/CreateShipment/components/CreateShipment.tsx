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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
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
  }));

  // Prepare options for the organisation field, but for intra-org shipments
  const intraOrganisationOptions = currentOrganisationBases
    .filter((base) => base.id !== baseId)
    .map((base) => ({
      value: base.id,
      label: base.name,
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

      <Tabs>
        <TabList>
          <Tab>PARTNERS</Tab>
          <Tab>{currentOrganisationLabel}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
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
              <input
                {...register("shipmentTarget")}
                id="shipmentTarget"
                type="hidden"
                value="partners"
              />
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
          </TabPanel>

          <TabPanel>
            <form onSubmit={handleSubmitIntraOrg(onSubmit)}>
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
              <input
                {...registerIntraOrg("shipmentTarget")}
                id="shipmentTarget"
                type="hidden"
                value="currentOrg"
              />
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
                    fieldId="receivingBase"
                    fieldLabel="Base"
                    placeholder="Please select a base"
                    errors={errorsIntraOrg}
                    control={controlIntraOrg}
                    options={intraOrganisationOptions}
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
                    isLoading={isSubmittingIntraOrg || isLoading}
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default CreateShipment;
