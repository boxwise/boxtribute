import { gql, useQuery } from "@apollo/client";
import { Center, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { BaseDataQuery, BaseDataQueryVariables } from "types/generated/graphql";

export const BASE_DATA = gql`
  query BaseData($baseId: ID!) {
    base(id: $baseId) {
      name
      locations {
        name
      }
    }
  }
`;

const BaseDashboardView = () => {
  const baseId = useParams<{ baseId: string }>().baseId!;

  const { loading, error, data } = useQuery<BaseDataQuery, BaseDataQueryVariables>(BASE_DATA, {
    variables: {
      baseId,
    },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  return (
    <Center>
      <Heading>Welcome to the base <Text as='u'>{data?.base?.name}</Text></Heading>
    </Center>
  );
};

export default BaseDashboardView;
