import { gql, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Flex, Heading, Spinner } from "@chakra-ui/react";

import BoxtributeLogo from "./BoxtributeLogo";
import StockDataFilter from "@boxtribute/shared-components/statviz/components/visualizations/stock/StockDataFilter";
import ErrorCard, {
  predefinedErrors,
} from "@boxtribute/shared-components/statviz/components/ErrorCard";

const RESOLVE_LINK = gql(`
  query resolveLink($code: String!) {
    # TODO: Configure generated gql.tada for the public schema.
    resolveLink(code: $code) {
      __typename
      ... on ResolvedLink {
        view
        urlParameters
        baseName
        organisationName
        data {
          # TODO: Refactor query once other views are implemented.
          ... on StockOverviewData {
            facts {
              productName
              categoryId
              gender
              boxesCount
              itemsCount
              sizeId
              tagIds
              boxState
              locationId
            }
            dimensions {
              category {
                id
                name
              }
              size {
                id
                name
              }
              tag {
                id
                name
                color
              }
              location {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`);

function matchErrorMessage(errorMsg: string) {
  switch (true) {
    case errorMsg.includes("Expired"):
      return `The link has expired.`;
    default:
      return `An unexpected error happened: ${errorMsg}`;
  }
}

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const codeParam = searchParams.get("code");

  if (codeParam) localStorage.setItem("code", codeParam);

  const code = codeParam ?? localStorage.getItem("code");

  const { data, loading, error } = useQuery(RESOLVE_LINK, { variables: { code } });

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {matchErrorMessage(error.message)}
      </Alert>
    );
  }

  if (loading) return <Spinner />;

  if (data === undefined) return <ErrorCard error={predefinedErrors.noData} />;

  if (codeParam) {
    const newParams = `view=${data?.resolveLink?.view.toLowerCase()}&${data?.resolveLink?.urlParameters}`;
    location.search = newParams;
    return <Spinner />;
  }

  return (
    <>
      <Flex gap={8} p={2} alignItems="center" flexDirection={["column", "row"]}>
        <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" />
        <Heading size="md">Organization: {data.resolveLink.organisationName}</Heading>
        <Heading size="md">Base: {data.resolveLink.baseName}</Heading>
      </Flex>
      {/* TODO: Match view with view returned from data once other views are implemented. */}
      <StockDataFilter stockOverview={data.resolveLink.data[0]} />
    </>
  );
}

export default App;
