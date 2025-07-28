import { ReactNode, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { Alert, AlertIcon, Flex, Heading, Skeleton } from "@chakra-ui/react";

import BoxtributeLogo from "./BoxtributeLogo";
import StockDataFilter from "@boxtribute/shared-components/statviz/components/visualizations/stock/StockDataFilter";
import ErrorCard, {
  predefinedErrors,
} from "@boxtribute/shared-components/statviz/components/ErrorCard";
import { tagFilterValuesVar } from "@boxtribute/shared-components/statviz/state/filter";
import { tagToFilterValue } from "@boxtribute/shared-components/statviz/components/filter/TagFilter";

const RESOLVE_LINK = gql(`
  query resolveLink($code: String!) {
    # TODO: Configure generated gql.tada for the public schema.
    resolveLink(code: $code) {
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

function ErrorPage({ children }: { children: ReactNode }) {
  return (
    <>
      <Alert status="error" mb={4}>
        <AlertIcon />
        {children}
      </Alert>
      <BoxtributeLogo alignSelf="center" w={156} backgroundSize="contain" ml={4} />
    </>
  );
}

function matchErrorMessage(errorMsg: string) {
  switch (true) {
    case errorMsg.includes("$code"):
      return `The link must contain a code in the URL.`;
    case errorMsg.includes("Expired"):
      return `The link has expired.`;
    case errorMsg.includes("Unknown"):
      return `Unknown link.`;
    default:
      return `An unexpected error happened: ${errorMsg || "Please try again, or contact us."}`;
  }
}

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const view = searchParams.get("view");

  const { data, loading, error } = useQuery(RESOLVE_LINK, { variables: { code } });

  // Get tag filters.
  useEffect(() => {
    const tags = data?.resolveLink?.data[0].dimensions?.tag?.map((t) => tagToFilterValue(t!));
    if (tags?.length) tagFilterValuesVar(tags);
  }, [data?.resolveLink?.data]);

  if (error) {
    return <ErrorPage>{matchErrorMessage(error.message)}</ErrorPage>;
  }

  if (loading) {
    return (
      <>
        <BoxtributeLogo w={156} backgroundSize="contain" p={2} />
        <Skeleton w={"840px"} h={"982px"} />
      </>
    );
  }

  if (data === undefined) {
    return (
      <ErrorPage>
        <ErrorCard error={predefinedErrors.noData} />
      </ErrorPage>
    );
  }

  if (["ExpiredLinkError", "UnknownLinkError"].includes(data?.resolveLink?.__typename)) {
    return <ErrorPage>{matchErrorMessage(data.resolveLink.__typename ?? "")}</ErrorPage>;
  }

  // Prepend Search Params with fetched link data params and reload the page while displaying a skeleton loader.
  if (!view) {
    location.search = `view=${data?.resolveLink?.view.toLowerCase()}&${data?.resolveLink?.urlParameters ?? "nofilters=true"}&code=${code}`;

    return (
      <>
        <BoxtributeLogo w={156} backgroundSize="contain" p={2} />
        <Skeleton w={"840px"} h={"982px"} />
      </>
    );
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
