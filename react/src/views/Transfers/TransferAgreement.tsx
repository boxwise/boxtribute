import { Controller, useForm } from "react-hook-form";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import {
  BasesForOrganisationsQuery,
  BasesForOrganisationsQueryVariables,
  OrganisationsQuery,
} from "types/generated/graphql";

import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
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

const TransferAgreement = () => {
  const [basesForOrganisations, { data: basesdata }] = useLazyQuery<
    BasesForOrganisationsQuery,
    BasesForOrganisationsQueryVariables
  >(BASES_ORGANISATIONS_QUERY);

  // const { register, handleSubmit } = useForm({
  //   defaultValues: {
  //     targetOrganisationId: "",
  //     type: "",
  //     checkbox: [],
  //     radio: "",
  //     message: ""
  //   }
  // });

  const [selectOrgId, setSelectedOrgId] = useState<string>();

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

  const onOrgDropdownChange = (e: React.FormEvent<HTMLSelectElement>): void => {
    const newSelectedOrgId = (e.target as HTMLInputElement).value;
    setSelectedOrgId(newSelectedOrgId);
    console.log("newSelectedOrgId", newSelectedOrgId);
  };
  return (
    <form>
      <Select placeholder="Select organisation" onChange={onOrgDropdownChange}>
        {data?.organisations?.map((option) => (
          <option value={option.id}>{option.name}</option>
        ))}
      </Select>
      <Select placeholder="Select bases">
        {basesdata?.organisation?.bases?.map((option) => (
          <option value={option.id}>{option.name}</option>
        ))}
      </Select>
      <Select placeholder="Transfer type direction">
        <option>Unidirectional</option>
        <option>Bidirectional</option>
      </Select>
      <DatePicker />
      <DatePicker />
      <Input type="submit" />
    </form>
  );
};

export default TransferAgreement;
