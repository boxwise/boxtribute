/* eslint-disable */
import "@testing-library/jest-dom";
import {
  screen,
  waitFor,
  fireEvent,
  cleanup,
  waitForElementToBeRemoved,
  queryByText,
} from "@testing-library/react";
import { render } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import BTBox, {
  BOX_BY_LABEL_IDENTIFIER_QUERY,
  UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
  UPDATE_STATE_IN_BOX_MUTATION,
  UPDATE_BOX_MUTATION,
} from "./BoxView";
import { generateMockBox } from "mocks/boxes";
import { BoxState } from "types/generated/graphql";
import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";

const initialQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({}),
    },
  },
};

const updateNumberOfItemsMutation = {
  request: {
    query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      numberOfItems: 32,
    },
  },
  result: {
    data: {
      updateBox: {
        labelIdentifier: "123",
      },
    },
  },
};

const numberOfItemsSuccessfullUpdatedRefetchQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ numberOfItems: 32 }),
    },
  },
};

// const mocks = [
//   ,
//   ,
//   {
//     request: {
//       query: BOX_BY_LABEL_IDENTIFIER_QUERY,
//       variables: {
//         labelIdentifier: "189123",
//       },
//     },
//     result: {
//       data: {
//         box: {
//           distributionEvent: null,
//           labelIdentifier: "189123",
//           location: {
//             base: {
//               distributionEventsBeforeReturnedFromDistributionState: [],
//               locations: [
//                 {
//                   id: "16",
//                   defaultBoxState: "InStock",
//                   name: "Stockroom",
//                 },
//                 {
//                   id: "17",
//                   defaultBoxState: "InStock",
//                   name: "WH1",
//                 },
//                 {
//                   id: "18",
//                   defaultBoxState: "InStock",
//                   name: "WH2",
//                 },
//               ],
//             },
//             id: "14",
//             defaultBoxState: "Lost",
//             name: "LOST",
//           },
//           numberOfItems: 32,
//           comment: "",
//           product: {
//             gender: "Boy",
//             name: "Snow trousers",
//           },
//           size: {
//             id: "52",
//             label: "Mixed",
//           },
//           state: "Scrap",
//           tags: [
//             {
//               color: "#90d4a2",
//               id: "17",
//               name: "test tag",
//             },
//           ],
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
//       variables: {
//         boxLabelIdentifier: "189123",
//         numberOfItems: 31,
//       },
//     },
//     result: {
//       data: {
//         updateBox: {
//           labelIdentifier: "189123",
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: BOX_BY_LABEL_IDENTIFIER_QUERY,
//       variables: {
//         labelIdentifier: "189123",
//       },
//     },
//     result: {
//       data: {
//         box: {
//           distributionEvent: null,
//           labelIdentifier: "189123",
//           location: {
//             base: {
//               distributionEventsBeforeReturnedFromDistributionState: [],
//               locations: [
//                 {
//                   id: "16",
//                   defaultBoxState: "InStock",
//                   name: "Stockroom",
//                 },
//                 {
//                   id: "17",
//                   defaultBoxState: "InStock",
//                   name: "WH1",
//                 },
//                 {
//                   id: "18",
//                   defaultBoxState: "InStock",
//                   name: "WH2",
//                 },
//               ],
//             },
//             id: "14",
//             defaultBoxState: "Lost",
//             name: "LOST",
//           },
//           numberOfItems: 31,
//           comment: "",
//           product: {
//             gender: "Boy",
//             name: "Snow trousers",
//           },
//           size: {
//             id: "52",
//             label: "Mixed",
//           },
//           state: "Scrap",
//           tags: [
//             {
//               color: "#90d4a2",
//               id: "17",
//               name: "test tag",
//             },
//           ],
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: UPDATE_STATE_IN_BOX_MUTATION,
//       variables: {
//         boxLabelIdentifier: "189123",
//         newState: "Lost",
//       },
//     },
//     result: {
//       data: {
//         updateBox: {
//           labelIdentifier: "189123",
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: UPDATE_STATE_IN_BOX_MUTATION,
//       variables: {
//         boxLabelIdentifier: "189123",
//         newState: "Scrap",
//       },
//     },
//     result: {
//       data: {
//         updateBox: {
//           labelIdentifier: "189123",
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: UPDATE_STATE_IN_BOX_MUTATION,
//       variables: {
//         boxLabelIdentifier: "189123",
//         newState: "InStock",
//       },
//     },
//     result: {
//       data: {
//         updateBox: {
//           labelIdentifier: "189123",
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: UPDATE_BOX_MUTATION,
//       variables: {
//         boxLabelIdentifier: "189123",
//         newLocationId: 17,
//       },
//     },
//     result: {
//       data: {
//         updateBox: {
//           distributionEvent: null,
//           labelIdentifier: "189123",
//           location: {
//             base: {
//               distributionEventsBeforeReturnedFromDistributionState: [],
//               locations: [
//                 {
//                   id: "16",
//                   defaultBoxState: "InStock",
//                   name: "Stockroom",
//                 },
//                 {
//                   id: "17",
//                   defaultBoxState: "InStock",
//                   name: "WH1",
//                 },
//                 {
//                   id: "18",
//                   defaultBoxState: "InStock",
//                   name: "WH2",
//                 },
//               ],
//             },
//             id: "17",
//             defaultBoxState: "InStock",
//             name: "WH1",
//           },
//           numberOfItems: 31,
//           comment: null,
//           product: {
//             gender: "Boy",
//             id: "347",
//             name: "Snow trousers",
//             sizeRange: {
//               sizes: [
//                 {
//                   id: "52",
//                   label: "Mixed",
//                 },
//               ],
//             },
//           },
//           size: {
//             id: "52",
//             label: "Mixed",
//           },
//           state: "InStock",
//           tags: [],
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: BOX_BY_LABEL_IDENTIFIER_QUERY,
//       variables: {
//         labelIdentifier: "123",
//       },
//     },
//     result: {
//       data: {
//         box: {
//           distributionEvent: null,
//           labelIdentifier: "123",
//           location: {
//             base: {
//               distributionEventsBeforeReturnedFromDistributionState: [],
//               locations: [
//                 {
//                   id: "16",
//                   defaultBoxState: "InStock",
//                   name: "Stockroom",
//                 },
//                 {
//                   id: "17",
//                   defaultBoxState: "InStock",
//                   name: "WH1",
//                 },
//                 {
//                   id: "18",
//                   defaultBoxState: "InStock",
//                   name: "WH2",
//                 },
//               ],
//             },
//             id: 17,
//             defaultBoxState: "InStock",
//             name: "WH1",
//           },
//           numberOfItems: 31,
//           comment: "",
//           product: {
//             gender: "Boy",
//             name: "Snow trousers",
//           },
//           size: {
//             id: "52",
//             label: "Mixed",
//           },
//           state: "InStock",
//           tags: [
//             {
//               color: "#90d4a2",
//               id: "17",
//               name: "test tag",
//             },
//           ],
//         },
//       },
//     },
//   },
// ];

// const waitTillLoadingIsDone = async () => {
//   await waitFor(() => {
//     const loadingInfo = screen.queryByText("Loading...");
//     expect(loadingInfo).toBeNull();
//   });
// };

// beforeEach(() => {
//   render(<BTBox />, {
//     routePath: "/bases/:baseId/boxes/:labelIdentifier",
//     initialUrl: "/bases/2/boxes/189123",
//     mocks,
//   });
// });
// // Test case 3.1.1.0
// it("3.1.1.0 - renders with an initial 'Loading...'", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   const loadingInfo = screen.getByTestId("loading-indicator");
//   expect(loadingInfo).toBeInTheDocument();
// });
// // Test case 3.1.1.1
// it("3.1.1.1 - renders Heading with valid box identifier", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   const boxHeader = screen.getByTestId("box-header");
//   expect(boxHeader).toHaveTextContent("Box 189123");
// });
// // Test case 3.1.1.2
// it("3.1.1.2 - renders sub heading with valid state", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   const boxSubheading = screen.getByTestId("box-subheader");
//   expect(boxSubheading).toHaveTextContent("Status: Lost");
// });
// // Test case 3.1.1.2.1
// it("3.1.1.2.1 - change box state color respectfully", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   let color;
//   const currentState = mocks[0].result.data.box?.state;
//   if (currentState === "Lost" || currentState === "Scrap") {
//     color = "#EB404A";
//   } else {
//     color = "#0CA789";
//   }
//   expect(screen.getByTestId("box-state")).toHaveStyle(`color: ${color}`);
// });
// // Test case 3.1.1.3
// it("3.1.1.3 - click on + and - to increase or decrease number of items", async () => {
//   cleanup();
//   render(<BTBox />, {
//     routePath: "/bases/:baseId/boxes/:labelIdentifier",
//     initialUrl: "/bases/2/boxes/123",
//     mocks,
//   });
//   await waitFor(waitTillLoadingIsDone);
//   const numberOfItemWhenIncreased = 31;

//   fireEvent.click(screen.getByTestId("increase-items"));
//   await waitFor(() => userEvent.type(screen.getByTestId("increase-number-items"), "1"));
//   fireEvent.click(screen.getByText("Submit"));

//   await waitFor(() => {
//     expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
//     expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(
//       `${numberOfItemWhenIncreased}x Snow trousers`,
//     );
//   });
// });
// // Test case 3.1.1.4 and 3.1.1.4.1
// it("3.1.1.4.(1) - clicking on Lost / Scrap must change box state respectfully", async () => {
//   await waitFor(waitTillLoadingIsDone);

//   fireEvent.click(screen.getByTestId("box-lost-btn"));
//   await waitFor(() => {
//     const boxSubheading = screen.getByTestId("box-subheader");
//     expect(boxSubheading).toHaveTextContent("Status: Lost");
//     expect(screen.getByTestId("box-state")).toHaveStyle("color: #EB404A");
//   });

//   fireEvent.click(screen.getByTestId("box-scrap-btn"));
//   await waitFor(() => {
//     const boxSubheading = screen.getByTestId("box-subheader");
//     expect(boxSubheading).toHaveTextContent("Status: Scrap");
//     expect(screen.getByTestId("box-state")).toHaveStyle("color: #EB404A");
//   });
// });
// // Test case 3.1.1.5
// it("3.1.1.5 - click on a location should move box to seleted place", async () => {
//   await waitFor(waitTillLoadingIsDone);

//   fireEvent.click(screen.getByTestId("location-wh1-btn"));
//   await waitFor(() => {
//     const boxLocationLabel = screen.getByTestId("box-location-label");
//     expect(boxLocationLabel).toHaveTextContent("Move this box from LOST to:");
//   });
// });

// // Test case 3.1.1.6
// it("3.1.1.6 - If Distro Event Not Available it should not shown", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   const distroEventSection = screen.getByTestId("box-sections");
//   expect(distroEventSection).not.toContain("Assign this Box to Distribution Event:");
// });
// // Test case 3.1.1.7
// it("3.1.1.7 - render tags correctly if box assigned tags", async () => {
//   await waitFor(waitTillLoadingIsDone);
//   const boxTags = screen.getByTestId("box-tags");
//   expect(boxTags).toBeInTheDocument();
//   expect(screen.getByText(/test tag/i)).toBeInTheDocument();
//   expect(boxTags).toHaveTextContent("test tag");
// });

// Test case 3.1.1.0 - renders with an initial 'Loading...'
it("3.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateNumberOfItemsMutation, numberOfItemsSuccessfullUpdatedRefetchQuery],
    addTypename: true,
  });

  // Test case 3.1.1.1 - renders Heading with valid box identifier
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.1.2 - renders sub heading with valid state
  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");

  // Test case 3.1.1.2.1 - change box state color respectfully
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #0CA789`);

  // Test case 3.1.1.3 - Click on + OR - Button
  expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(`31x Snow trousers`);

  const addToItemsButton = screen.getByTestId("increase-items");
  await user.click(addToItemsButton);
  // screen.debug();
  expect(await screen.findByText(/add items to the Box/i)).toBeInTheDocument();
  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));
  expect(await screen.findByText("32x Snow trousers")).toBeInTheDocument();

  // expect(screen.findByText("32x Snow trousers")).toHaveTextContent(`32x Snow trousers`);

  // // await waitFor(() => {
  // //   // expect(screen.getByTestId("boxview-number-items")).toBeInTheDocument();
  // //   expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(`32x Snow trousers`);
  // // });
});

it("3.1.5 - Move location", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery],
    addTypename: true,
  });

  expect(await screen.findByText(/Move this box from/i)).toBeInTheDocument();

  const boxLocationLabel = screen.getByTestId("box-location-label");
  expect(boxLocationLabel).toHaveTextContent("Move this box from WH Men to:");

  // const whMenLocation = screen.getByRole("button", { name: /wh men/i });

  // await user.click(whMenLocation);

  //   fireEvent.click(screen.getByTestId("location-wh1-btn"));
  //   await waitFor(() => {
  //     const boxLocationLabel = screen.getByTestId("box-location-label");
  //     expect(boxLocationLabel).toHaveTextContent("Move this box from LOST to:");
  //   });
});
