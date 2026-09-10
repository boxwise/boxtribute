import { ReactNode, useMemo, useEffect, useCallback } from "react";
import type React from "react";
import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertIcon, Flex, Heading, Skeleton, Select } from "@chakra-ui/react";

import BoxtributeLogo from "./BoxtributeLogo";
import StockOverviewRingFilterContainer from "@boxtribute/shared-components/statviz/components/visualizations/stock/StockOverviewRingFilterContainer";
import ErrorCard, {
  predefinedErrors,
} from "@boxtribute/shared-components/statviz/components/ErrorCard";
import {
  STOCK_URL_PARAMS,
  readStockFiltersFromUrl,
  type BoxesOrItemsCount,
  type ICategoryOption,
  type ILocationOption,
  type ITagOption,
} from "@boxtribute/shared-components/statviz/utils/dashboardFilters";

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

  const [routerSearchParams, setSearchParams] = useSearchParams();
  const boxesOrItems: BoxesOrItemsCount =
    routerSearchParams.get(STOCK_URL_PARAMS.boxesOrItems) === "ic" ? "itemsCount" : "boxesCount";

  const { data, loading, error } = useQuery(RESOLVE_LINK, { variables: { code } });

  const allCategories = useMemo<ICategoryOption[]>(
    () =>
      (data?.resolveLink?.data[0]?.dimensions?.category ?? []).map((c) => ({
        id: Number(c.id),
        name: c.name ?? "",
      })),
    [data],
  );

  const allLocations = useMemo<ILocationOption[]>(
    () =>
      (data?.resolveLink?.data[0]?.dimensions?.location ?? []).map((l) => ({
        id: Number(l.id),
        name: l.name ?? "",
      })),
    [data],
  );

  const allTags = useMemo<ITagOption[]>(
    () =>
      (data?.resolveLink?.data[0]?.dimensions?.tag ?? []).map((t) => ({
        id: Number(t.id),
        name: t.name ?? "",
        color: t.color ?? "#999",
        value: String(t.id),
        label: t.name ?? "",
        urlId: String(t.id),
      })),
    [data],
  );

  const appliedFilters = useMemo(
    () => readStockFiltersFromUrl(routerSearchParams, [], allCategories, allLocations, allTags),
    [routerSearchParams, allCategories, allLocations, allTags],
  );

  const handleBoxesOrItemsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newParams = new URLSearchParams(routerSearchParams);
      newParams.set(STOCK_URL_PARAMS.boxesOrItems, e.target.value === "itemsCount" ? "ic" : "bc");
      setSearchParams(newParams);
    },
    [routerSearchParams, setSearchParams],
  );

  // Redirect to full URL with view param once link data has loaded
  useEffect(() => {
    if (data && !view && data?.resolveLink?.view) {
      const urlParams = data?.resolveLink?.urlParameters ?? "nofilters=true";
      window.location.search = `view=${data?.resolveLink?.view.toLowerCase()}&${urlParams}&code=${code}`;
    }
  }, [data, view, code]);

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
        <Heading size="md">ORGANIZATION: {data.resolveLink.organisationName.toUpperCase()}</Heading>
        <Heading size="md">BASE: {data.resolveLink.baseName.toUpperCase()}</Heading>
      </Flex>
      <Flex
        borderWidth="1"
        padding="15"
        marginBottom="15"
        shadow="md"
        justifyContent="left"
        background="white"
      >
        <Select
          size="md"
          value={boxesOrItems}
          onChange={handleBoxesOrItemsChange}
          aria-label="Display inventory as"
          bg="white"
          width="120px"
        >
          <option value="boxesCount">Boxes</option>
          <option value="itemsCount">Items</option>
        </Select>
      </Flex>
      <StockOverviewRingFilterContainer
        stockOverview={data.resolveLink.data[0]}
        appliedFilters={appliedFilters}
        boxesOrItems={boxesOrItems}
      />
    </>
  );
}

export default App;
