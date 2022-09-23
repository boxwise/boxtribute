import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "utils/test-utils";
import Box, { BOX_BY_LABEL_IDENTIFIER_QUERY } from "./BoxView";

describe("Box view", () => {
  const mocks = [
    {
      request: {
        query: BOX_BY_LABEL_IDENTIFIER_QUERY,
        variables: {
          labelIdentifier: "189123",
        },
      },
      result: {
        data: {
          box: {
            distributionEvent: null,
            labelIdentifier: "189123",
            location: {
              __typename: "ClassicLocation",
              base: {
                distributionEventsBeforeReturnedFromDistributionState: [],
                locations: [
                  {
                    id: "14",
                    name: "LOST",
                  },
                  {
                    id: "15",
                    name: "SCRAP",
                  },
                  {
                    id: "16",
                    name: "Stockroom",
                  },
                  {
                    id: "17",
                    name: "WH1",
                  },
                  {
                    id: "18",
                    name: "WH2",
                  },
                ],
              },
              id: "14",
              name: "LOST",
            },
            numberOfItems: 31,
            product: {
              gender: "Boy",
              name: "Snow trousers",
            },
            size: {
              id: "52",
              label: "Mixed",
            },
            state: "Lost",
            tags: [{
              "color": "#000",
              "id": "17",
              "name": "new"
            }],
          },
        },
      },
    },
  ];

  const waitTillLoadingIsDone = async () => {
    await waitFor(() => {
      const loadingInfo = screen.queryByText("Loading...");
      expect(loadingInfo).toBeNull();
    });
  };

  beforeEach(() => {
    render(<Box />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/1/boxes/189123",
      mocks,
    });
  });

  it("renders with an initial 'Loading...'", () => {
    const loadingInfo = screen.getByTestId("loading-indicator");
    expect(loadingInfo).toBeInTheDocument();
  });

  // it("eventually removes the 'Loading...' and shows the table head", async () => {
  //   await waitFor(waitTillLoadingIsDone);
  //   const productColumnHeader = screen.getByTestId("loading-indicator");
  //   expect(productColumnHeader).toBeInTheDocument();
  // });


});
