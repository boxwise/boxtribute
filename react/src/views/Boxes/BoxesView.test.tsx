import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { render } from "utils/test-utils";
import Boxes, { BOXES_FOR_BASE_QUERY } from "./BoxesView";

describe("Boxes view", () => {
  const mocks = [
    {
      request: {
        query: BOXES_FOR_BASE_QUERY,
        variables: {
          baseId: "1",
        },
      },
      result: {
        data: {
          base: {
            __typename: "Base",
            locations: [
              {
                __typename: "Location",
                name: "Warehouse 1",
                boxes: {
                  __typename: "BoxPage",
                  totalCount: 27,
                  elements: [
                    {
                      __typename: "Box",
                      labelIdentifier: "1234",
                      state: "Donated",
                      size: "4",
                      product: {
                        __typename: "Product",
                        gender: "Women",
                        name: "Long Dress",
                      },
                      numberOfItems: 64,
                    },
                    {
                      __typename: "Box",
                      labelIdentifier: "1235",
                      state: "Donated",
                      size: "52",
                      product: {
                        __typename: "Product",
                        gender: "Women",
                        name: "Socks",
                      },
                      numberOfItems: 35,
                    },
                  ],
                },
              },
              {
                __typename: "Location",
                name: "Warehouse 2",
                boxes: {
                  __typename: "BoxPage",
                  totalCount: 31,
                  elements: [
                    {
                      __typename: "Box",
                      labelIdentifier: "1236",
                      state: "Lost",
                      size: "54",
                      product: {
                        __typename: "Product",
                        gender: "UnisexBaby",
                        name: "Blanket",
                      },
                      numberOfItems: 40,
                    },
                    {
                      __typename: "Box",
                      labelIdentifier: "1237",
                      state: "MarkedForShipment",
                      size: "68",
                      product: {
                        __typename: "Product",
                        gender: "UnisexBaby",
                        name: "Top 2-6 Months ",
                      },
                      numberOfItems: 16,
                    },
                    {
                      __typename: "Box",
                      labelIdentifier: "1238",
                      state: "Lost",
                      size: "118",
                      product: {
                        __typename: "Product",
                        gender: "UnisexKid",
                        name: "Jacket Sleeveless ",
                      },
                      numberOfItems: 81,
                    },
                  ],
                },
              },
              {
                __typename: "Location",
                name: "Warehouse 3",
                boxes: {
                  __typename: "BoxPage",
                  totalCount: 16,
                  elements: [
                    {
                      __typename: "Box",
                      labelIdentifier: "1239",
                      state: "InStock",
                      size: "68",
                      product: {
                        __typename: "Product",
                        gender: "Women",
                        name: "Hijab",
                      },
                      numberOfItems: 4,
                    },
                    {
                      __typename: "Box",
                      labelIdentifier: "1230",
                      state: "InStock",
                      size: "68",
                      product: {
                        __typename: "Product",
                        gender: "Boy",
                        name: "Top Boys (18-24 months)",
                      },
                      numberOfItems: 95,
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

  const waitTillLoadingIsDone = async () => {
    await waitFor(() => {
      const loadingInfo = screen.queryByText("Loading...");
      expect(loadingInfo).toBeNull();
    });
  };

  beforeEach(() => {
    render(<Boxes />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/1/boxes",
      mocks,
    });
  });

  it("renders with an initial 'Loading...'", () => {
    const loadingInfo = screen.getByTestId("loading-indicator")
    expect(loadingInfo).toBeInTheDocument();
  });

  it("eventually removes the 'Loading...' and shows the table head", async () => {
    await waitFor(waitTillLoadingIsDone);
    const productColumnHeader = screen.getByTestId("loading-indicator");
    expect(productColumnHeader).toBeInTheDocument();
  });

  describe("search filter", () => {
    beforeEach(waitTillLoadingIsDone);
    it("initially it shows also entries in the table that don't match the later used search term", async () => {
      const firstEntryInOriginalRowSet = screen.queryByRole("gridcell", {
        name: "Top 2-6 Months",
      });
      expect(firstEntryInOriginalRowSet).toBeInTheDocument();
    });

    // describe("applying the search term 'Blanket' in the filter", () => {
    //   beforeEach(() => {
    //     const searchField = screen.getByPlaceholderText("Search");
    //     fireEvent.change(searchField, { target: { value: "Blanket" } });
    //   });
    //   it("only shows entries in the table that match the filter search term", async () => {
    //     await waitFor(() => {
    //       const firstEntryInOriginalRowSet = screen.queryByRole("gridcell", {
    //         name: "Top 2-6 Months",
    //       });
    //       expect(firstEntryInOriginalRowSet).toBeNull();
    //     });

    //     const blanketProduct = screen.queryByRole("gridcell", {
    //       name: "Blanket",
    //     });
    //     expect(blanketProduct).toBeInTheDocument();
    //   });
    // });
  });

  // describe("filter dropdowns", () => {
  //   beforeEach(waitTillLoadingIsDone);
  //   it("initially it shows also entries in the table that don't match the later used filter value", async () => {
  //     const nonWomenEntryInOriginalRowSet = screen.queryByRole("gridcell", {
  //       name: "1237",
  //     });
  //     expect(nonWomenEntryInOriginalRowSet).toBeInTheDocument();
  //   });

  //   describe("switching the Gender filter to the value 'Women'", () => {
  //     beforeEach(() => {
  //       const genderFilter = screen.getByLabelText("Gender:");

  //       fireEvent.change(genderFilter, { target: { value: "Women" } });
  //     });

  //     it("only shows entries in the table that match the selected filter dropdown value", async () => {
  //       await waitFor(() => {
  //         const nonWomenEntryInOriginalRowSet = screen.queryByRole("gridcell", {
  //           name: "1237",
  //         });
  //         expect(nonWomenEntryInOriginalRowSet).toBeNull();
  //       });

  //       const womenEntryInFilteredRowSet = screen.queryByRole("gridcell", {
  //         name: "1235",
  //       });
  //       expect(womenEntryInFilteredRowSet).toBeInTheDocument();
  //     });
  //   });
  // });

  // describe("sorting by fields/column headers", () => {
  //   beforeEach(waitTillLoadingIsDone);
  //   it("sorts the table data correctly when the user clicks on the column headers", async () => {
  //     const productColumnHeader = screen.getByTitle("Toggle SortBy for 'Product'");
  //     fireEvent.click(productColumnHeader);
  //     const rowsAfterFirstSortingClick = screen.getAllByRole("row");

  //     expect(rowsAfterFirstSortingClick[1]).toHaveTextContent("Blanket");

  //     fireEvent.click(productColumnHeader);
  //     const rowsAfterSecondSortingClick = screen.getAllByRole("row");
  //     expect(rowsAfterSecondSortingClick[1]).toHaveTextContent(
  //       "Top Boys (18-24 months)"
  //     );
  //   });
  // });
});
