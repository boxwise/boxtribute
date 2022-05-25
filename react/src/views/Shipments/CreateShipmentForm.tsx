import { useForm } from "react-hook-form";
import { gql, useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
  BasesForOrganisationsQuery,
  BasesForOrganisationsQueryVariables,
  CreateTransferAgreementMutation,
  CreateTransferAgreementMutationVariables,
  OrganisationsQuery,
  TransferAgreementCreationInput,
  TransferAgreementType,
} from "types/generated/graphql";

import { FormControl, Button, Select, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DatePicker from "views/Boxes/components/DatePicker";
import { useNavigate, useParams } from "react-router-dom";

export const ORGANISATIONS_QUERY = gql`
  query Organisations {
    organisations {
      id
      name
    }
  }
`;

export const BASES_ORGANISATIONS_QUERY = gql`
  query BasesForOrganisations($organisationId: ID!) {
    organisation(id: $organisationId) {
      id
      name
      bases {
        id
        name
      }
    }
  }
`;

export const CREATE_TRANSFER_AGREEMENT_MUTATION = gql`
  mutation CreateTransferAgreement(
    $creationInput: TransferAgreementCreationInput!
  ) {
    createTransferAgreement(creationInput: $creationInput) {
      id
    }
  }
`;

// export interface BoxFormValues {
//   size?: string | null;
//   productForDropdown: OptionsGroup;
//   sizeForDropdown?: OptionsGroup;
// }

export interface TransferAgreementFormValues {
  targetOrganisationId: string;
  targetBasesIds: string[];
  transferType: string;
}

const TransferAgreement = () => {
  const [basesForOrganisations, { data: basesdata }] = useLazyQuery<
    BasesForOrganisationsQuery,
    BasesForOrganisationsQueryVariables
  >(BASES_ORGANISATIONS_QUERY);

  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  const [createTransferAgreement, mutationStatus] = useMutation<
    CreateTransferAgreementMutation,
    CreateTransferAgreementMutationVariables
  >(CREATE_TRANSFER_AGREEMENT_MUTATION);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TransferAgreementFormValues>({
    defaultValues: {
      targetOrganisationId: "",
      targetBasesIds: [],
      transferType: "",
    },
  });

  const [selectOrgId, setSelectedOrgId] = useState<string>();
  // const [submittedVal, setSubmittedVal] = useState();

  useEffect(() => {
    if (selectOrgId != null)
      basesForOrganisations({ variables: { organisationId: selectOrgId } });
  }, [basesForOrganisations, selectOrgId]);

  useEffect(() => {
    mutationStatus?.data?.createTransferAgreement?.id &&
      navigate(
        `/bases/${baseId}/transfers/${mutationStatus?.data?.createTransferAgreement?.id}`
      );
  }, [mutationStatus, navigate, baseId]);

  const { loading, error, data } =
    useQuery<OrganisationsQuery>(ORGANISATIONS_QUERY);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  if (mutationStatus.loading) {
    return <div>Creating transfer agreement...</div>;
  }
  if (mutationStatus.error) {
    return <div>Error: {JSON.stringify(mutationStatus.error)}</div>;
  }
  //the dropdowns don't work properly

  const onOrgDropdownChange = (e: React.FormEvent<HTMLSelectElement>): void => {
    const newSelectedOrgId = (e.target as HTMLInputElement).value;
    setSelectedOrgId(newSelectedOrgId);
    console.log("newSelectedOrgId", newSelectedOrgId);
  };

  const onSubmit = (data: TransferAgreementFormValues) => {
    // setSubmittedVal(data);
    const creationInput: TransferAgreementCreationInput = {
      targetOrganisationId: parseInt(data.targetOrganisationId),
      type: TransferAgreementType[data.transferType],
    };
    createTransferAgreement({ variables: { creationInput } });
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrap spacing="30px">
        <WrapItem>
          <FormControl
            id="targetOrganisationId"
            // isInvalid={errors.targetOrganisationId}
          >
            <Select
              {...register("targetOrganisationId")}
              placeholder="Select Organisation"
              onChange={onOrgDropdownChange}
            >
              {data?.organisations?.map((org) => (
                <option value={org.id}>{org.name}</option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <FormControl id="targetBasesIds">
            <Select
              {...register("targetBasesIds")}
              ismulti
              placeholder="Select bases"
            >
              {basesdata?.organisation?.bases?.map((option) => (
                <option value={option.id}>{option.name}</option>
              ))}
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <FormControl id="transferType">
            <Select
              {...register("transferType")}
              placeholder="Select transfer type"
            >
              <option>Unidirectional</option>
              <option>Bidirectional</option>
            </Select>
          </FormControl>
        </WrapItem>
        <WrapItem>
          <DatePicker />
        </WrapItem>
        <WrapItem>
          <DatePicker />
        </WrapItem>
        <WrapItem>
          <Button type="submit">Submit</Button>
        </WrapItem>
      </Wrap>
    </form>
  );
};

export default TransferAgreement;
