import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { render } from "utils/test-utils";
import BTBox, { BOX_BY_LABEL_IDENTIFIER_QUERY } from "./BoxView";

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
            tags: [],
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
    render(<BTBox />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/2/boxes/189123",
      mocks,
    });
  });

  it("renders with an initial 'Loading...'", async () => {
    await waitFor(waitTillLoadingIsDone);
    const loadingInfo = screen.getByTestId("loading-indicator");
    expect(loadingInfo).toBeInTheDocument();
  });

  it("3.1.1.1 - renders Heading with valid box identifier", async () => {
    await waitFor(waitTillLoadingIsDone);
    const boxHeader = screen.getByTestId("box-header");
    expect(boxHeader).toHaveTextContent(
      "Box " + mocks[0].result.data.box.labelIdentifier
    );
  });

  it("3.1.1.2 - renders sub heading with valid state", async () => {
    await waitFor(waitTillLoadingIsDone);
    const boxSubheading = screen.getByTestId("box-subheader");
    expect(boxSubheading).toHaveTextContent(
      "State: " + mocks[0].result.data.box.state
    );
  });

  // it("3.1.1.3 - click on + and - to increase or decrease number of items", async() => {
  //   await waitFor(waitTillLoadingIsDone);
  //   const boxSubheading = screen.getByTestId("box-subheader");
  //   expect(boxSubheading).toHaveTextContent(
  //     "State: " + mocks[0].result.data.box.state
  //   );
  // });

  // it("eventually removes the 'Loading...' and shows the table head", async () => {
  //   await waitFor(waitTillLoadingIsDone);
  //   const productColumnHeader = screen.getByTestId("loading-indicator");
  //   expect(productColumnHeader).toBeInTheDocument();
  // });
});
