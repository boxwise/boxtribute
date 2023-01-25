import {
  Box,
  Button,
  ButtonGroup,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectField, { IDropdownOption } from "components/Form/SelectField";
import RadioGroupField from "components/Form/RadioGroupField";
import DateField from "components/Form/DateField";

export interface IBaseData {
  id: string;
  name: string;
}

export interface IBasesForOrganisationData {
  id: string;
  name: string;
  bases: IBaseData[];
}

const singleSelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const TransferAgreementFormDataSchema = z.object({
  currentOrganisationSelectedBases: singleSelectOptionSchema
    .array()
    .min(1)
    .nonempty("Please select at least one base"),
  transferType: z.string().nullable().refine(Boolean, { message: "Please choose a transfer type" }),

  partnerOrganisation: singleSelectOptionSchema
    .refine(Boolean, { message: "Please select a partner organisation" })
    .transform((selectedOption) => selectedOption || { label: "", value: "" }),
  partnerOrganisationSelectedBases: singleSelectOptionSchema.array().optional(),
  validFrom: z
    .date({
      required_error: "Please enter a valid date",
      invalid_type_error: "Please enter a valid date",
    })
    .optional()
    .transform((value) => value?.toISOString().substring(0, 10)),
  validUntil: z
    .date()
    .optional()
    .transform((value) => value?.toISOString().substring(0, 10)),
  comment: z.string().optional(),
});
// .refine(
//   (data) => {
//     // eslint-disable-next-line no-console
//     console.log(data);
//     if (typeof data.validFrom !== "undefined" && typeof data.validUntil !== "undefined") {
//       const dateDiff = data.validUntil.getTime() - data.validFrom.getTime();
//       return dateDiff > 0;
//     }
//     return true;
//   },
//   {
//     message: "Please enter greater date for the valid until",
//     path: ["validUntil"], // path of error
//   },
// );

export type ITransferAgreementFormData = z.infer<typeof TransferAgreementFormDataSchema>;

export interface ICreateTranferAgreementProps {
  currentOrganisation: IBasesForOrganisationData;
  partnerOrganisationsWithTheirBasesData: IBasesForOrganisationData[];
  onSubmitCreateTransferAgreementForm: (
    transferAgreementFormValues: ITransferAgreementFormData,
  ) => void;
}

function CreateTransferAgreement({
  currentOrganisation,
  partnerOrganisationsWithTheirBasesData,
  onSubmitCreateTransferAgreementForm,
}: ICreateTranferAgreementProps) {
  const sourceBasesForDropdownGroups: Array<IDropdownOption> | undefined =
    currentOrganisation?.bases.map((base) => ({
      label: base.name,
      value: base.id,
    }));

  const partnerOrganisationsForDropdownGroups: Array<IDropdownOption> | undefined =
    partnerOrganisationsWithTheirBasesData?.map((organisation) => ({
      label: organisation.name,
      value: organisation.id,
    }));

  const onSubmit: SubmitHandler<ITransferAgreementFormData> = (data) => {
    // eslint-disable-next-line no-console
    onSubmitCreateTransferAgreementForm(data);
  };

  const {
    handleSubmit,
    control,
    register,
    resetField,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ITransferAgreementFormData>({
    resolver: zodResolver(TransferAgreementFormDataSchema),
  });

  const [basesOptionsForPartnerOrg, setBasesOptionsForPartnerOrg] = useState<IDropdownOption[]>([]);
  const [validUntilMinDate, setValidUntilMinDate] = useState("");
  const partnerOrganisation = watch("partnerOrganisation");
  const validFrom = watch("validFrom");

  useEffect(() => {
    if (partnerOrganisation != null) {
      const partnerBasesDataForCurrentOrganisation = partnerOrganisationsWithTheirBasesData.find(
        (organisation) => organisation.id === partnerOrganisation.value,
      );

      setBasesOptionsForPartnerOrg(
        () =>
          partnerBasesDataForCurrentOrganisation?.bases?.map((base) => ({
            label: base.name,
            value: base.id,
          })) || [],
      );

      resetField("partnerOrganisationSelectedBases");
      // Put a default value for partnerOrganisationSelectedBases when there's only one option
      if (partnerBasesDataForCurrentOrganisation?.bases.length === 1) {
        setValue("partnerOrganisationSelectedBases", [
          {
            label: partnerBasesDataForCurrentOrganisation?.bases[0].name,
            value: partnerBasesDataForCurrentOrganisation?.bases[0].id,
          },
        ]);
      }
    }
    if (currentOrganisation?.bases.length === 1) {
      setValue("currentOrganisationSelectedBases", [
        {
          label: currentOrganisation?.bases[0].name,
          value: currentOrganisation?.bases[0].id,
        },
      ]);
    }

    if (validFrom) {
      setValidUntilMinDate(
        new Date(new Date(validFrom).setDate(new Date(validFrom).getDate() + 1))
          .toJSON()
          .split("T")[0],
      );
    } else {
      setValue("validFrom", new Date().toISOString().substring(0, 10));
    }
  }, [
    partnerOrganisation,
    resetField,
    setValue,
    partnerOrganisationsWithTheirBasesData,
    currentOrganisation?.bases,
    validFrom,
  ]);

  return (
    <Box w={["100%", "100%", "60%", "40%"]}>
      <Heading fontWeight="bold" mb={2} as="h2">
        New Transfer Agreement
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <List spacing={2}>
          <ListItem>
            <SelectField
              fieldId="currentOrganisationSelectedBases"
              isMulti
              fieldLabel={`${currentOrganisation?.name} Bases`}
              placeholder="Please select base(s)"
              options={sourceBasesForDropdownGroups}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <RadioGroupField
              fieldId="transferType"
              fieldLabel="Transfer Type"
              options={["Sending to", "Receiving from", "Sending to / Receiving from"]}
              direction="column"
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="partnerOrganisation"
              fieldLabel="Partner organisation"
              placeholder="Please select an organisation"
              options={partnerOrganisationsForDropdownGroups}
              errors={errors}
              control={control}
            />
          </ListItem>
          <ListItem>
            <SelectField
              fieldId="partnerOrganisationSelectedBases"
              fieldLabel="Partner bases"
              placeholder="Select a Base(s)"
              errors={errors}
              isMulti
              isRequired={false}
              control={control}
              options={basesOptionsForPartnerOrg}
            />
          </ListItem>
          <ListItem>
            <DateField
              fieldId="validFrom"
              fieldLabel="Valid from"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              minDate={new Date().toJSON().split("T")[0]}
            />
          </ListItem>
          <ListItem>
            <DateField
              fieldId="validUntil"
              fieldLabel="Valid until"
              errors={errors}
              control={control}
              register={register}
              isRequired={false}
              minDate={validUntilMinDate}
            />
          </ListItem>
          <ListItem>
            <FormLabel htmlFor="comment">Comment</FormLabel>
            <Box border="2px" borderRadius={0}>
              <Input border="0" borderRadius={0} type="string" {...register("comment")} />
            </Box>
          </ListItem>
        </List>

        <Stack spacing={4}>
          <ButtonGroup gap="4">
            <Button mt={4} isLoading={isSubmitting} type="submit" borderRadius="0" w="full">
              Create Agreement
            </Button>
          </ButtonGroup>
        </Stack>
      </form>
    </Box>
  );
}

export default CreateTransferAgreement;
