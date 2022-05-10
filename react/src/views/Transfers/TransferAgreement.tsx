import { Controller, useForm } from "react-hook-form";
import { gql, useQuery } from "@apollo/client";
import { OrganisationsQuery } from "types/generated/graphql";

import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
} from "@chakra-ui/react";

export const ORGANISATIONS_QUERY = gql`
  query Organisations {
    organisations {
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
  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

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

  const organisation = watch("organisation");

  // if (test === "United States") {
  //   selectOptions = ["test", "test1"];
  // } else if (test === "Canada") {
  //   selectOptions = ["test2", "test13"];
  // } else {
  //   selectOptions = [];
  // }
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        control={control}
        name="organisation"
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <Select
            value={value}
            placeholder="Select organisation"
            onChange={onChange}
          >
            {data?.organisations.map((option) => (
              <option value={option.name}>{option.name}</option>
            ))}
          </Select>
        )}
      />
      <Input type="submit" />
    </form>
  );
};

export default TransferAgreement;
