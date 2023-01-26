import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { organisation1, organisations } from "mocks/oraganisations";
import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";
import CreateTransferAgreementView, {
  ALL_ORGS_AND_BASES_QUERY,
} from "./CreateTransferAgreementView";

const initialQuery = {
  request: {
    query: ALL_ORGS_AND_BASES_QUERY,
    variables: {},
  },
  result: {
    data: {
      organisations,
    },
  },
};

const initialQueryNetworkError = {
  request: {
    query: ALL_ORGS_AND_BASES_QUERY,
    variables: {},
  },
  result: {
    errors: [new GraphQLError("Error!")],
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
  await assertOptionsInSelectField(user, /partner organisation/i, [/boxcare/i], title);
  // Test case 4.1.1.3	- Content: Displays Partner Bases Select Options When Partner Organisation Selected
  await selectOptionInSelectField(user, /partner organisation/i, "BoxCare");
  expect(await screen.findByText("BoxCare")).toBeInTheDocument();
  const selectBaseDropDown = screen.getByRole("combobox", { name: /partner bases/i });
  expect(selectBaseDropDown).toBeInTheDocument();
  await user.click(selectBaseDropDown);
  expect(await screen.findByText("Thessaloniki")).toBeInTheDocument();
  expect(await screen.findByText("Samos")).toBeInTheDocument();
  const selectedBase = screen.getByRole("button", { name: /samos/i });
  expect(selectedBase).toBeInTheDocument();
  await user.click(selectedBase);
  // Test case 4.1.1.4	- Content: Display Source Organisation name on the label
  expect(screen.getByText(/boxaid bases/i)).toBeInTheDocument();
});

// Test case 4.1.2
it("4.1.2 - Input Validations", async () => {
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

  const submitButton = await screen.findByRole("button", { name: /create agreement/i });
  expect(submitButton).toBeInTheDocument();

  // Test case 4.1.2.1 - Source Organisation SELECT field cannot be empty
  const sourceSelectedBaseRemoveButton = screen.getByRole("button", { name: /remove lesvos/i });
  await user.click(sourceSelectedBaseRemoveButton);
  expect(screen.getByText(/please select base\(s\)/i)).toBeInTheDocument();
  await user.click(submitButton);
  expect(screen.getByText(/please select at least one base/i)).toBeInTheDocument();
  // Test case 4.1.2.2 - Partner Organisation SELECT field cannot be empty
  expect(screen.getByText(/please select an organisation/i)).toBeInTheDocument();
  // Test case 4.1.2.3 - Transfer type Radio Button cannot be empty
  // Test case 4.1.2.4 - The "Valid from" field is optional, but only valid date formats should be entered
  // Test case 4.1.2.5 - The "Valid until" field is optional, but only valid date formats should be entered
});

// Test case 4.1.3
it("4.1.3 - Click on Submit Button", async () => {
  // const user = userEvent.setup();
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

  const submitButton = await screen.findByRole("button", { name: /create agreement/i });
  expect(submitButton).toBeInTheDocument();

  // Test case 4.1.3.1 - Redirect to Transfers Agreements Page
  // Test case 4.1.3.2 - Form data was valid, but the mutation failed
  // Test case 4.1.3.3 - Form data was valid and mutation was successful
});

// Test case 4.1.4
it("4.1.4 - Failed to Fetch Initial Data", async () => {
  // const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/transfers/agreements/create",
    initialUrl: "/transfers/agreements/create",
    mocks: [initialQueryNetworkError],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  // Test case 4.1.4.1 - No Partner Organisations and Bases Data
  expect(
    await screen.findByText(
      /could not fetch Organisation and Base data! Please try reloading the page./i,
    ),
  ).toBeInTheDocument();
  // screen.debug();
});
