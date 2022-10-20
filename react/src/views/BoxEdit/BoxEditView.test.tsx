import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { render } from "utils/test-utils";
import BoxEditView, { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY } from "./BoxEditView";

describe("BoxEdit view", () => {
  const mocks = [
    {
      request: {
        query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_QUERY,
        variables: {
          labelIdentifier: "123",
        },
      },
      result: {
        data: {
          box: {
            labelIdentifier: "123",
            location: {
              base: {
                locations: [
                  {
                    id: "1",
                    name: "Shop",
                  },
                  {
                    id: "4",
                    name: "Stockroom",
                  },
                  {
                    id: "5",
                    name: "WH",
                  },
                  {
                    id: "6",
                    name: "WH Women",
                  },
                  {
                    id: "7",
                    name: "WH Men",
                  },
                  {
                    id: "8",
                    name: "WH Children",
                  },
                  {
                    id: "9",
                    name: "WH Babies",
                  },
                  {
                    id: "10",
                    name: "WH Shoes",
                  },
                  {
                    id: "11",
                    name: "WH New arrivals",
                  },
                  {
                    id: "12",
                    name: "WH Hygiene",
                  },
                  {
                    id: "13",
                    name: "WH Seasonal",
                  },
                ],
              },
              id: "1",
              name: "Shop",
            },
            numberOfItems: 62,
            product: {
              gender: "Women",
              id: "19",
              name: "Long Sleeves",
              sizeRange: {
                sizes: [
                  {
                    id: "1",
                    label: "S",
                  },
                  {
                    id: "2",
                    label: "M",
                  },
                  {
                    id: "3",
                    label: "L",
                  },
                  {
                    id: "4",
                    label: "XL",
                  },
                  {
                    id: "5",
                    label: "XS",
                  },
                  {
                    id: "71",
                    label: "Mixed",
                  },
                ],
              },
            },
            size: {
              id: "2",
              label: "M",
            },
          },
          products: {
            elements: [
              {
                category: {
                  name: "Jackets / Outerwear",
                },
                gender: "Men",
                id: "1",
                name: "Winter Jackets",
                sizeRange: {
                  label: "XS, S, M, L, XL",
                  sizes: [
                    {
                      id: "1",
                      label: "S",
                    },
                    {
                      id: "2",
                      label: "M",
                    },
                    {
                      id: "3",
                      label: "L",
                    },
                    {
                      id: "4",
                      label: "XL",
                    },
                    {
                      id: "5",
                      label: "XS",
                    },
                    {
                      id: "71",
                      label: "Mixed",
                    },
                  ],
                },
              },
              {
                category: {
                  name: "Jackets / Outerwear",
                },
                gender: "Women",
                id: "2",
                name: "Winter Jackets",
                sizeRange: {
                  label: "XS, S, M, L, XL",
                  sizes: [
                    {
                      id: "1",
                      label: "S",
                    },
                    {
                      id: "2",
                      label: "M",
                    },
                    {
                      id: "3",
                      label: "L",
                    },
                    {
                      id: "4",
                      label: "XL",
                    },
                    {
                      id: "5",
                      label: "XS",
                    },
                    {
                      id: "71",
                      label: "Mixed",
                    },
                  ],
                },
              },
              {
                category: {
                  name: "Tops",
                },
                gender: "Men",
                id: "3",
                name: "Sweater / Jumper",
                sizeRange: {
                  label: "XS, S, M, L, XL",
                  sizes: [
                    {
                      id: "1",
                      label: "S",
                    },
                    {
                      id: "2",
                      label: "M",
                    },
                    {
                      id: "3",
                      label: "L",
                    },
                    {
                      id: "4",
                      label: "XL",
                    },
                    {
                      id: "5",
                      label: "XS",
                    },
                    {
                      id: "71",
                      label: "Mixed",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  ];

  beforeEach(() => {
    render(<BoxEditView />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier/edit",
      initialUrl: "/bases/1/boxes/123/edit",
      mocks,
    });
  });

  const waitTillLoadingIsDone = async () => {
    await waitFor(() => {
      const loadingInfo = screen.queryByText("Loading...");
      expect(loadingInfo).toBeNull();
    });
  };

  it("renders with an initial 'Loading...'", () => {
    const loadingInfo = screen.getByTestId("loading-indicator");
    expect(loadingInfo).toBeInTheDocument();
  });

  // Test case 3.2.1.1
  it("3.2.1.1 - Heading", async () => {
    await waitFor(waitTillLoadingIsDone);
    const boxHeader = screen.getByTestId("box-header");
    expect(boxHeader).toHaveTextContent("Box 123");
  });
  // Test case 3.2.1.2
  it("3.2.1.2 - Product SELECT field", async () => {
    expect(screen.getByTestId("products-list")).toBeInTheDocument();
  });
  // Test case 3.2.1.2.1
  it("3.2.1.2.1 - Product SELECT field Options", async () => {
    expect(screen.getByTestId("products-list")).toHaveAttribute("id", "label");
  });

  // Test case 3.2.1.3
  it("3.2.1.2.3 - Size SELECT field", async () => {
    expect(screen.getByTestId("products-size-list")).toBeInTheDocument();
  });
  // Test case 3.2.1.3.1
  it("3.2.1.3.1 - Size SELECT field Options", async () => {
    expect(screen.getByTestId("products-size-list")).toHaveAttribute("id", "label");
  });

  // Test case 3.2.1.4
  it("3.2.1.4 - Number Of Items", async () => {
    expect(screen.getByTestId("number-items")).toHaveValue(mocks[0].result.data.box.numberOfItems);
  });

  // Test case 3.2.1.5
  it("3.2.1.5 - Location Select field", async () => {
    expect(screen.getByTestId("box-location")).toBeInTheDocument();
  });
  // Test case 3.2.1.5
  it("3.2.1.5.1 - Location Select field Options", async () => {
    expect(screen.getByTestId("box-location")).toHaveAttribute("id", "label");
  });

  // Test case 3.2.1.6
  it("3.2.1.6 - Tags", async () => {
    expect(screen.getByTestId("box-tags")).toBeInTheDocument();
  });
  // Test case 3.2.1.7
  it("3.2.1.7 - Comments", async () => {
    expect(screen.getByTestId("box-comment")).toBeInTheDocument();
  });
  // Test case 3.2.1.7
  it("3.2.1.8 - Update Box Button", async () => {
    expect(screen.getByTestId("update-box-btn")).toBeInTheDocument();
  });
});
