import { fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransferAgreementForm, {
  ORGANISATIONS_QUERY,
  BASES_ORGANISATIONS_QUERY,
} from "./CreateTransferAgreementForm";
import { render } from "utils/test-utils";

describe("Create Transfer Agreement form", () => {
  const mocks = [
    {
      request: {
        query: ORGANISATIONS_QUERY,
      },
      result: {
        data: {
          organisations: [
            {
              id: "1",
              name: "BoxAid",
            },
            {
              id: "2",
              name: "BoxOrg",
            },
            {
              id: "3",
              name: "BoxPlace",
            },
            {
              id: "4",
              name: "BoxHouse",
            },
          ],
        },
      },
    },
    {
      request: {
        query: BASES_ORGANISATIONS_QUERY,
      },
      result: {
        data: {},
      },
    },
  ];
});

// organisations {
//     id
//     name
//   }

//   const waitTillLoadingIsDone = async () => {
//     await waitFor(() => {
//       const loadingInfo = screen.queryByText("Loading...");
//       expect(loadingInfo).toBeNull();
//     });
//   };

//   beforeEach(() => {
//     render(<Boxes />, {
//       routePath: "/bases/:baseId/boxes",
//       initialUrl: "/bases/1/boxes",
//       mocks,
//     });
//   });

//   it("renders with an initial 'Loading...'", () => {
//     const loadingInfo = screen.getByText("Loading...");
//     expect(loadingInfo).toBeInTheDocument();
//   });

//   it("eventually removes the 'Loading...' and shows the table head", async () => {
//     await waitFor(waitTillLoadingIsDone);
//     const heading = await screen.getByText("Product");
//     expect(heading).toBeInTheDocument();
//   });

//   describe("search filter", () => {
//     beforeEach(waitTillLoadingIsDone);
//     it("initially it shows also entries in the table that don't match the later used search term", async () => {
//       const firstEntryInOriginalRowSet = screen.queryByRole("gridcell", {
//         name: "Top 2-6 Months",
//       });
//       expect(firstEntryInOriginalRowSet).toBeInTheDocument();
//     });

//     describe("applying the search term 'Blanket' in the filter", () => {
//       beforeEach(() => {
//         const searchField = screen.getByPlaceholderText("Search");
//         fireEvent.change(searchField, { target: { value: "Blanket" } });
//       });
//       it("only shows entries in the table that match the filter search term", async () => {
//         await waitFor(() => {
//           const firstEntryInOriginalRowSet = screen.queryByRole("gridcell", {
//             name: "Top 2-6 Months",
//           });
//           expect(firstEntryInOriginalRowSet).toBeNull();
//         });

//         const blanketProduct = screen.queryByRole("gridcell", {
//           name: "Blanket",
//         });
//         expect(blanketProduct).toBeInTheDocument();
//       });
//     });
//   });

//   describe("filter dropdowns", () => {
//     beforeEach(waitTillLoadingIsDone);
//     it("initially it shows also entries in the table that don't match the later used filter value", async () => {
//       const nonWomenEntryInOriginalRowSet = screen.queryByRole("gridcell", {
//         name: "1237",
//       });
//       expect(nonWomenEntryInOriginalRowSet).toBeInTheDocument();
//     });

//     describe("applying the search term 'Blanket' in the filter", () => {
//       beforeEach(() => {
//         const genderFilter = screen.getByLabelText("Gender:");

//         fireEvent.change(genderFilter, { target: { value: "Women" } });
//       });

//       it("only shows entries in the table that match the selected filter dropdown value", async () => {
//         await waitFor(() => {
//           const nonWomenEntryInOriginalRowSet = screen.queryByRole("gridcell", {
//             name: "1237",
//           });
//           expect(nonWomenEntryInOriginalRowSet).toBeNull();
//         });

//         const womenEntryInFilteredRowSet = screen.queryByRole("gridcell", {
//           name: "1235",
//         });
//         expect(womenEntryInFilteredRowSet).toBeInTheDocument();
//       });
//     });
//   });

//   describe("sorting by fields/column headers", () => {
//     beforeEach(waitTillLoadingIsDone);
//     it("sorts the table data correctly when the user clicks on the column headers", async () => {
//       const productColumnHeader = screen.getByText("Product");
//       fireEvent.click(productColumnHeader);
//       const rowsAfterFirstSortingClick = screen.getAllByRole("row");

//       expect(rowsAfterFirstSortingClick[1]).toHaveTextContent("Blanket");

//       fireEvent.click(productColumnHeader);
//       const rowsAfterSecondSortingClick = screen.getAllByRole("row");
//       expect(rowsAfterSecondSortingClick[1]).toHaveTextContent(
//         "Top Boys (18-24 months)"
//       );
//     });
//   });
// });
