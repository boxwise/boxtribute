import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "utils/test-utils";
import BTBox, {
  BOX_BY_LABEL_IDENTIFIER_QUERY,
  UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
} from "./BoxView";
import userEvent from "@testing-library/user-event";

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
    {
      request: {
        query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
        variables: {
          boxLabelIdentifier: "189123",
          numberOfItems: 32,
        },
      },
      result: {
        data: {
          updateBox: {
            labelIdentifier: "189123",
          },
        },
      },
    },
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
            numberOfItems: 32,
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
    expect(boxHeader).toHaveTextContent("Box 189123");
  });

  it("3.1.1.2 - renders sub heading with valid state", async () => {
    await waitFor(waitTillLoadingIsDone);
    const boxSubheading = screen.getByTestId("box-subheader");
    expect(boxSubheading).toHaveTextContent("State: Lost");
  });

  it("3.1.1.3 - click on + and - to increase or decrease number of items", async () => {
    await waitFor(waitTillLoadingIsDone);
    let numberOfItemWhenIncreased = 32;
    // let numberOfItemWhenDecreased = 31;
    fireEvent.click(screen.getByTestId("increase-items"));
    await waitFor(() =>
      userEvent.type(screen.getByTestId("increase-number-items"), "1")
    );
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
      expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(
        "# " + numberOfItemWhenIncreased
      );
    });

    // fireEvent.click(screen.getByTestId("decrease-items"));
    // await waitFor(() =>
    //   userEvent.type(screen.getByTestId("decrease-number-items"), "1")
    // );

    // await waitFor(() => {
    //   expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
    //   expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(
    //     "# " + numberOfItemWhenDecreased
    //   );
    // });
  });

  // it("eventually removes the 'Loading...' and shows the table head", async () => {
  //   await waitFor(waitTillLoadingIsDone);
  //   const productColumnHeader = screen.getByTestId("loading-indicator");
  //   expect(productColumnHeader).toBeInTheDocument();
  // });
});
