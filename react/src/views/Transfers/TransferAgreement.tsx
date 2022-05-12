// import { Controller, useForm } from "react-hook-form";
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

  // const {
  //   handleSubmit,
  //   control,
  //   register,
  //   watch,
  //   formState: { errors, isSubmitting },
  // } = useForm();

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

  // function onSubmit(values) {
  //   return new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       alert(JSON.stringify(values, null, 2));
  //       resolve();
  //     }, 3000);
  //   });
  // }

  // const organisation = watch("organisation");

  // if (test === "United States") {
  //   selectOptions = ["test", "test1"];
  // } else if (test === "Canada") {
  //   selectOptions = ["test2", "test13"];
  // } else {
  //   selectOptions = [];
  // }

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

      <Input type="submit" />
    </form>
  );
};

export default TransferAgreement;
