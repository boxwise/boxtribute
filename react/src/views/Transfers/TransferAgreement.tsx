import { Controller, useForm } from "react-hook-form";
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

import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
  Flex,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DatePicker from "views/Boxes/components/DatePicker";

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

// const [updateBoxLocation, mutationStatus] = useMutation<
// UpdateLocationOfBoxMutation,
// UpdateLocationOfBoxMutationVariables
// >(UPDATE_LOCATION_OF_BOX_MUTATION);

// if (loading) {
// return <div>Loading...</div>;
// }
// if (mutationStatus.loading) {
// return <div>Updating box...</div>;
// }
// if (error || mutationStatus.error) {
// console.error(error || mutationStatus.error);
// return <div>Error!</div>;
// }

// const boxData = mutationStatus.data?.updateBox || data?.box;

const TransferAgreement = () => {
  const [basesForOrganisations, { data: basesdata }] = useLazyQuery<
    BasesForOrganisationsQuery,
    BasesForOrganisationsQueryVariables
  >(BASES_ORGANISATIONS_QUERY);

  const [createTransferAgreement, mutationStatus] = useMutation<
    CreateTransferAgreementMutation,
    CreateTransferAgreementMutationVariables
  >(CREATE_TRANSFER_AGREEMENT_MUTATION);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      targetOrganisationId: "",
      targetBasesIds: "",
      transferType: "",
    },
  });

  const [selectOrgId, setSelectedOrgId] = useState<string>();
  const [submittedVal, setSubmittedVal] = useState();

  useEffect(() => {
    if (selectOrgId != null)
      basesForOrganisations({ variables: { organisationId: selectOrgId } });
  }, [basesForOrganisations, selectOrgId]);

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

  const onOrgDropdownChange = (e: React.FormEvent<HTMLSelectElement>): void => {
    const newSelectedOrgId = (e.target as HTMLInputElement).value;
    setSelectedOrgId(newSelectedOrgId);
    console.log("newSelectedOrgId", newSelectedOrgId);
  };

  // const onSubmit = (data) => {
  //   setSubmittedVal(data);
  //   console.log(data);
  // };

  const creationInput: TransferAgreementCreationInput = {
    targetOrganisationId: 2,
    type: TransferAgreementType.Unidirectional,
  };

  return (
    <form>
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
              isMulti
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
          <Input type="submit" />
        </WrapItem>
        <Button
          onClick={() =>
            createTransferAgreement({ variables: { creationInput } })
          }
        ></Button>
        {JSON.stringify(mutationStatus.data)}
      </Wrap>
    </form>
  );
};

export default TransferAgreement;
