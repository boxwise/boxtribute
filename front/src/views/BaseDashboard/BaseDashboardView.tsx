import { useQuery } from "@apollo/client";
import { graphql } from "../../../../graphql/graphql";
import { Center, Heading, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

export const BASE_DATA = graphql(`
  query BaseData($baseId: ID!) {
    base(id: $baseId) {
      name
      locations {
        name
      }
    }
  }
`);

function BaseDashboardView() {
  const baseId = useAtomValue(selectedBaseIdAtom);

  const { loading, error, data } = useQuery(BASE_DATA, {
    variables: {
      baseId,
    },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error!</div>;
  }

  return (
    <Center>
      <Heading>
        Welcome to the base <Text as="u">{data?.base?.name}</Text>
      </Heading>
    </Center>
  );
}

export default BaseDashboardView;
