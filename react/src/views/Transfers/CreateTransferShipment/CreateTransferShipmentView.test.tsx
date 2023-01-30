// import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render } from "tests/test-utils";
// import userEvent from "@testing-library/user-event";
import { organisation1 } from "mocks/organisations";
// import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";
// import { TransferAgreementType } from "types/generated/graphql";
import { transferAgreement1 } from "mocks/transferAgreements";
import CreateTransferShipmentView, {
  ALL_ORGS_AND_BASES_WITH_TRANSFER_AGREEMENTS_QUERY,
} from "./CreateTransferShipmentView";

const initialQuery = {
  request: {
    query: ALL_ORGS_AND_BASES_WITH_TRANSFER_AGREEMENTS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        name: "Lesvos",
        organisation: {
          __typename: "Organisation",
          id: "1",
          name: "BoxAid",
        },
      },
      transferAgreements: [transferAgreement1],
    },
  },
};

// const initialQueryNetworkError = {
//   request: {
//     query: "",
//     variables: {},
//   },
//   result: {
//     errors: [new GraphQLError("Error!")],
//   },
// };

// const successfulMutation = {
//   request: {
//     query: "",
//     variables: {
//       transferAgreementId: 1,
//       sourceBaseId: 2,
//       targetBaseId: 3,
//     },
//   },
//   result: {
//     data: {
//       createTransferAgreement: {
//         id: 1,
//       },
//     },
//   },
// };

// const mutationNetworkError = {
//   request: {
//     query: "",
//     variables: {
//       transferAgreementId: 1,
//       sourceBaseId: 2,
//       targetBaseId: 3,
//     },
//   },
//   error: new Error(),
// };

// Test case 4.3.1
it("4.3.1 - Initial load of Page", async () => {
  // const user = userEvent.setup();
  render(<CreateTransferShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipment/create",
    initialUrl: "/bases/1/transfers/shipment/create",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  const title = await screen.findByRole("heading", { name: "Start New Shipment" });
  expect(title).toBeInTheDocument();
  // Test case 4.3.1.1	- Content: Displays Source Base Label
  expect(screen.getByText(/boxaid - lesvos/i)).toBeInTheDocument();
});
