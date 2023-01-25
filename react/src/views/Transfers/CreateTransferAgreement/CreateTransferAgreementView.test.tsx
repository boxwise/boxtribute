/* eslint-disable */
import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import CreateTransferAgreementView, {
  ALL_ORGS_AND_BASES_QUERY,
} from "./CreateTransferAgreementView";
import { organisation1, organisations } from "mocks/oraganisations";
import { assertOptionsInSelectField } from "tests/helpers";

const initialQuery = {
  request: {
    query: ALL_ORGS_AND_BASES_QUERY,
    variables: {},
  },
  result: {
    data: {
      organisations: organisations,
    },
  },
};

// Test case 4.1.1
it("4.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/transfers/agreements/create",
    initialUrl: "/transfers/agreements/create",
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

  const title = await screen.findByRole("heading", { name: "New Transfer Agreement" });
  expect(title).toBeInTheDocument();
  // Test case 4.1.4 -  Content: Display Source Organisation name on the label
  expect(screen.getByText(/boxaid bases/i)).toBeInTheDocument();

  // Test case 4.1.1.2 - Content: Displays Partner Orgs Select Options
  await assertOptionsInSelectField(user, /Partner Organ/i, [/Care/i], title);
  // await waitFor(() => expect(screen.getByText(/BoxCare/)).toBeInTheDocument());
});
