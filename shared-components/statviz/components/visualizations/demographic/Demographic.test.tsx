import { MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { it, expect, describe } from "vitest";
import { render, screen } from "../../../../tests/testUtils";
import DemographicDataContainer, { DEMOGRAPHIC_QUERY } from "./DemographicDataContainer";

describe("Demographic Visualizations", () => {
  const mockDemographicsQuery = ({
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
        query: DEMOGRAPHIC_QUERY,
        variables: { baseId },
      },
      result: getResult(),
      error: networkError ? new Error() : undefined,
      delay,
    };
  };

  it("x.x.x.x - user wants to see createdBoxes viz, but a network error is returned", async () => {
    render(<DemographicDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockDemographicsQuery({ networkError: true })],
    });

    expect(await screen.findByText(/An unexpected error happened/i)).toBeInTheDocument();
  });

  it("x.x.x.x - user waits for data and sees the loading spinner", async () => {
    render(<DemographicDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockDemographicsQuery({ delay: 250 })],
    });

    expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });
});
