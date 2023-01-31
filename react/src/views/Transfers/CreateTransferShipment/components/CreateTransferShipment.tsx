import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  List,
  ListItem,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FunctionComponent, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import { Props } from "chakra-react-select";
import { useNavigate, useParams } from "react-router-dom";

export interface IBaseData {
  id: string;
  name: string;
}

// eslint-disable-next-line react/function-component-definition
export const ReceivingIcon: FunctionComponent<Props> = () => (
  <Icon verticalAlign="center" width="23" height="26" viewBox="0 0 23 26" fill="none">
    <path d="M14 1H22V25H14" stroke="#2D3748" strokeWidth="2" />
    <path
      // eslint-disable-next-line max-len
      d="M12.172 11.778L6.808 6.414L8.222 5L16 12.778L8.222 20.556L6.808 19.142L12.172 13.778H0V11.778H12.172Z"
      fill="#2D3748"
    />
  </Icon>
);

// eslint-disable-next-line react/function-component-definition
export const SendingIcon: FunctionComponent<Props> = () => (
  <Icon verticalAlign="center" width="23" height="26" viewBox="0 0 23 26" fill="none">
    <path
      // eslint-disable-next-line max-len
      d="M19.172 11.778L13.808 6.414L15.222 5L23 12.778L15.222 20.556L13.808 19.142L19.172 13.778H7V11.778H19.172Z"
      fill="#2D3748"
    />
    <path d="M9 25H1V1H9" stroke="#2D3748" strokeWidth="2" />
  </Icon>
);

export interface IOrganisationsAgreementsDataData {
  agreementId: string;
  specialNote: string;
  orgId: string;
  orgName: string;
  orgBases: IBaseData[];
}

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const TransferShipmentFormDataSchema = z.object({
  partnerOrganisation: singleSelectOptionSchema
    .refine(Boolean, { message: "Please select a partner organisation" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  partnerOrganisationSelectedBase: singleSelectOptionSchema
    .refine(Boolean, { message: "Please select a partner base" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
});

export type ITransferShipmentFormData = z.infer<typeof TransferShipmentFormDataSchema>;

export interface ICreateTranferShipmentProps {
  currentOrganisationLabel: string;
  partnerOrganisationsAgreementsData: IOrganisationsAgreementsDataData[];
  onSubmitCreateTransferShipmentForm: (
    transferShipmentFormValues: ITransferShipmentFormData,
  ) => void;
}

function CreateTransferShipment({
  currentOrganisationLabel,
  partnerOrganisationsAgreementsData,
  onSubmitCreateTransferShipmentForm,
}: ICreateTranferShipmentProps) {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  const partnerOrganisationsForDropdownGroups: Array<IDropdownOption> | undefined =
    partnerOrganisationsAgreementsData?.map((organisation) => ({
      label: organisation.orgName,
      value: organisation.orgId,
    }));

  const onSubmit: SubmitHandler<ITransferShipmentFormData> = (data) => {
    // eslint-disable-next-line
    onSubmitCreateTransferShipmentForm(data);
  };

  const {
    handleSubmit,
    control,
    resetField,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ITransferShipmentFormData>({
    resolver: zodResolver(TransferShipmentFormDataSchema),
  });

  const [basesOptionsForPartnerOrg, setBasesOptionsForPartnerOrg] = useState<IDropdownOption[]>([]);
  const partnerOrganisation = watch("partnerOrganisation");

  useEffect(() => {
    if (partnerOrganisation != null) {
      const partnerBasesDataForSelectedOrganisation = partnerOrganisationsAgreementsData.find(
        (organisation) => organisation.orgId === partnerOrganisation.value,
      );

      setBasesOptionsForPartnerOrg(
        () =>
          partnerBasesDataForSelectedOrganisation?.orgBases?.map((base) => ({
            label: base.name,
            value: base.id,
          })) || [],
      );

      resetField("partnerOrganisationSelectedBase");
      // Put a default value for partnerOrganisationSelectedBases when there's only one option
      if (partnerBasesDataForSelectedOrganisation?.orgBases.length === 1) {
        setValue("partnerOrganisationSelectedBase", {
          label: partnerBasesDataForSelectedOrganisation?.orgBases[0].name,
          value: partnerBasesDataForSelectedOrganisation?.orgBases[0].id,
        });
      }
    }
  }, [partnerOrganisation, resetField, setValue, partnerOrganisationsAgreementsData]);

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
              fieldId="partnerOrganisation"
              fieldLabel="Organisation"
              placeholder="Please select an organisation"
              options={partnerOrganisationsForDropdownGroups}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="partnerOrganisationSelectedBase"
              fieldLabel="Base"
              placeholder="Please select a base"
              errors={errors}
              control={control}
              options={basesOptionsForPartnerOrg}
            />
          </ListItem>
          {/* <ListItem>
            <Text>Agreement #{} Comment</Text>
          </ListItem> */}
        </List>

        <Stack spacing={4}>
          <ButtonGroup gap="4">
            <Button
              mt={10}
              isLoading={isSubmitting}
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
              isLoading={isSubmitting}
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

export default CreateTransferShipment;
