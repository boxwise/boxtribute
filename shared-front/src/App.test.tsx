import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { render, screen } from "@testing-library/react";
import { theme } from "@boxtribute/shared-components/utils/theme";
import App, { RESOLVE_LINK } from "./App";

// ---------------------------------------------------------------------------
// Mock the nivo pie chart so we can verify data without SVG rendering
// ---------------------------------------------------------------------------
vi.mock("@boxtribute/shared-components/statviz/components/nivo/PieChart", () => ({
  default: ({
    data,
    centerData,
  }: {
    data: { id: string; value: number }[];
    centerData?: { level: number; grouping: string };
  }) => (
    <div data-testid="pie-chart">
      {centerData && (
        <div data-testid="pie-center">{`${centerData.level} ${centerData.grouping}`}</div>
      )}
      {data.map((d) => (
        <div key={d.id} data-testid="pie-slice" data-id={d.id} data-value={String(d.value)}>
          {`${d.id}: ${d.value}`}
        </div>
      ))}
    </div>
  ),
}));

function renderApp(url: string, mocks: MockedResponse[]) {
  window.history.pushState({}, "", url);
  return render(
    <ChakraProvider theme={theme}>
      <MockedProvider mocks={mocks} defaultOptions={{ query: { errorPolicy: "all" } }}>
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    </ChakraProvider>,
  );
}

const stockOverviewData = {
  __typename: "ResolvedLink",
  view: "StockOverview",
  urlParameters: "",
  baseName: "Base Alpha",
  organisationName: "Organisation One",
  data: [
    {
      __typename: "StockOverviewData",
      facts: [
        {
          productName: "shoes",
          categoryId: 1,
          gender: "Male",
          boxesCount: 5,
          itemsCount: 10,
          sizeId: 1,
          tagIds: [],
          boxState: "InStock",
          locationId: 1,
        },
        {
          productName: "shirts",
          categoryId: 2,
          gender: "Female",
          boxesCount: 3,
          itemsCount: 6,
          sizeId: 2,
          tagIds: [],
          boxState: "InStock",
          locationId: 2,
        },
      ],
      dimensions: {
        category: [
          { id: 1, name: "Category A" },
          { id: 2, name: "Category B" },
        ],
        size: [
          { id: 1, name: "Size A" },
          { id: 2, name: "Size B" },
        ],
        tag: [],
        location: [
          { id: 1, name: "Location A" },
          { id: 2, name: "Location B" },
        ],
      },
    },
  ],
};

function resolveLinkMock({
  code = "abc123",
  result,
  error,
}: {
  code?: string | null;
  result?: object;
  error?: Error;
}): MockedResponse {
  return {
    request: {
      query: RESOLVE_LINK,
      variables: { code },
    },
    result,
    error,
  };
}

describe("App", () => {
  it("shows an unexpected error message when the request fails with a network error", async () => {
    renderApp("/?code=abc123", [
      resolveLinkMock({
        error: new Error("NetworkError when attempting to fetch resource."),
      }),
    ]);

    expect(await screen.findByText(/An unexpected error happened/i)).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("shows an unknown link error message", async () => {
    renderApp("/?code=abc123", [
      resolveLinkMock({
        result: { data: { resolveLink: { __typename: "UnknownLinkError" } } },
      }),
    ]);

    expect(await screen.findByText("Unknown link.")).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("shows an expired link error message", async () => {
    renderApp("/?code=abc123", [
      resolveLinkMock({
        result: { data: { resolveLink: { __typename: "ExpiredLinkError" } } },
      }),
    ]);

    expect(await screen.findByText("The link has expired.")).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("shows a missing code error message", async () => {
    renderApp("/", [
      resolveLinkMock({
        code: null,
        result: {
          data: null,
          errors: [
            new GraphQLError("Variable '$code' of non-null type 'String!' must not be null."),
          ],
        },
      }),
    ]);

    expect(await screen.findByText("The link must contain a code in the URL.")).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("displays boxes count grouped by category by default", async () => {
    renderApp("/?code=abc123&view=stockoverview", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("8 boxes");
    expect(screen.getByText("Category A: 5")).toBeInTheDocument();
    expect(screen.getByText("Category B: 3")).toBeInTheDocument();
    expect(screen.getByText("ORGANIZATION: ORGANISATION ONE")).toBeInTheDocument();
    expect(screen.getByText("BASE: BASE ALPHA")).toBeInTheDocument();
  });

  it("groups by gender when srg=g", async () => {
    renderApp("/?code=abc123&view=stockoverview&srg=g", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("8 boxes");
    expect(screen.getByText("Male: 5")).toBeInTheDocument();
    expect(screen.getByText("Female: 3")).toBeInTheDocument();
  });

  it("groups by category when srg=cn", async () => {
    renderApp("/?code=abc123&view=stockoverview&srg=cn", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("8 boxes");
    expect(screen.getByText("Category A: 5")).toBeInTheDocument();
    expect(screen.getByText("Category B: 3")).toBeInTheDocument();
  });

  it("groups by size when srg=s", async () => {
    renderApp("/?code=abc123&view=stockoverview&srg=s", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("8 boxes");
    expect(screen.getByText("Size A: 5")).toBeInTheDocument();
    expect(screen.getByText("Size B: 3")).toBeInTheDocument();
  });

  it("groups by location when srg=l", async () => {
    renderApp("/?code=abc123&view=stockoverview&srg=l", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("8 boxes");
    expect(screen.getByText("Location A: 5")).toBeInTheDocument();
    expect(screen.getByText("Location B: 3")).toBeInTheDocument();
  });

  it("shows items count grouped by category when sboi=ic", async () => {
    renderApp("/?code=abc123&view=stockoverview&sboi=ic", [
      resolveLinkMock({ result: { data: { resolveLink: stockOverviewData } } }),
    ]);

    expect(await screen.findByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-center")).toHaveTextContent("16 items");
    expect(screen.getByText("Category A: 10")).toBeInTheDocument();
    expect(screen.getByText("Category B: 6")).toBeInTheDocument();
  });
});
