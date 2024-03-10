import { it, expect, vi, describe } from "vitest";
import { GraphQLError } from "graphql";
import { MockedResponse } from "@apollo/client/testing";
import MovedBoxesDataContainer, { MOVED_BOXES_QUERY } from "./MovedBoxesDataContainer";
import { render, screen, waitFor } from "../../../../tests/testUtils";
import { movedBoxesResultMockData } from "../../../testData";

const mockResponsiveSankey = vi.fn();

describe("Moved Boxes Visualizations", () => {
  const mockMovedBoxesQuery = ({
    baseId = 1,
    networkError = false,
    graphqlError = false,
    delay = 0,
    mockData = {},
  }): MockedResponse => {
    const getResult = () => {
      if (networkError) return undefined;
      if (graphqlError)
        return {
          data: null,
          errors: [new GraphQLError("Error!")],
        };
      return {
        data: mockData,
        errors: undefined,
      };
    };

    return {
      request: {
        query: MOVED_BOXES_QUERY,
        variables: { baseId },
      },
      result: getResult(),
      error: networkError ? new Error() : undefined,
      delay,
    };
  };

  vi.mock("@nivo/sankey", () => ({
    ResponsiveSankey: (props) => {
      mockResponsiveSankey(props);

      return <div>ResponsiveSankey</div>;
    },
  }));

  it("x.x.x.x - user scans wants to see movedBoxes viz, but a network error is returned", async () => {
    render(<MovedBoxesDataContainer />, {
      routePath: "/bases/:baseId/",
      initialUrl: "/bases/1/",
      mocks: [mockMovedBoxesQuery({ networkError: true })],
    });

    expect(await screen.findByText(/An unexpected error happened/i)).toBeInTheDocument();
  });

  it("x.x.x.x - user waits for data and sees the loading spinner", async () => {
    render(<MovedBoxesDataContainer />, {
      routePath: "/bases/:baseId/",
      initialUrl: "/bases/1/",
      mocks: [mockMovedBoxesQuery({ delay: 250 })],
    });

    expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });

  it("x.x.x.x - user selects a timerange where no data is present and sees the No data view", async () => {
    render(<MovedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz?stg=cn&boi=bc&cbg=m&to=2024-02-17&from=2023-11-17",
      mocks: [mockMovedBoxesQuery({ mockData: movedBoxesResultMockData })],
    });

    expect(
      await screen.findByText(/No data for the selected time range or selected filters/i),
    ).toBeInTheDocument();
  });

  it("x.x.x.x - user sees movedBoxes viz", async () => {
    render(<MovedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz?stg=cn&boi=bc&cbg=m&to=2023-09-02&from=2023-01-30",
      mocks: [mockMovedBoxesQuery({ mockData: movedBoxesResultMockData })],
    });

    await waitFor(() => expect(mockResponsiveSankey).toHaveBeenCalled());
  });
});
