import { MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { it, expect, describe } from "vitest";
import CreatedBoxesDataContainer, { CREATED_BOXES_QUERY } from "./CreatedBoxesDataContainer";
import { render, screen } from "../../../../tests/testUtils";
import createdBoxes from "../../../mocks/createdBoxes";

describe("Created Boxes Visualizations", () => {
  const mockCreatedBoxesQuery = ({
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
        query: CREATED_BOXES_QUERY,
        variables: { baseId },
      },
      result: getResult(),
      error: networkError ? new Error() : undefined,
      delay,
    };
  };

  it("x.x.x.x - user wants to see createdBoxes viz, but a network error is returned", async () => {
    render(<CreatedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockCreatedBoxesQuery({ networkError: true })],
    });

    expect(await screen.findByText(/An unexpected error happened/i)).toBeInTheDocument();
  });

  it("x.x.x.x - user waits for data and sees the loading spinner", async () => {
    render(<CreatedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockCreatedBoxesQuery({ delay: 250 })],
    });

    expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });

  it("x.x.x.x - user sees createdBoxes viz", async () => {
    render(<CreatedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockCreatedBoxesQuery({ mockData: createdBoxes })],
    });

    // expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });

  it("x.x.x.x - user calls page with some filters", async () => {
    render(<CreatedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockCreatedBoxesQuery({ mockData: createdBoxes })],
    });

    // expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });

  it("x.x.x.x - user selects timerange without data", async () => {
    render(<CreatedBoxesDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz?stg=cn&boi=bc&cbg=m&to=2021-09-02&from=2022-01-30",
      mocks: [mockCreatedBoxesQuery({ mockData: createdBoxes })],
    });

    // expect(
    //   await screen.findByText(/No data for the selected time range or selected filters/i),
    // ).toBeInTheDocument();
  });
});
