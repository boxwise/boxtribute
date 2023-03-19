import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render, cleanup, fireEvent } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { organisation1, organisations } from "mocks/organisations";
import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";
import { TransferAgreementType } from "types/generated/graphql";
import { addDays } from "date-fns";
import { base1 } from "mocks/bases";
import CreateTransferAgreementView, {
  ALL_ORGS_AND_BASES_QUERY,
  CREATE_AGREEMENT_MUTATION,
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

const successfulMutation = {
  request: {
    query: CREATE_AGREEMENT_MUTATION,
    variables: {
      initiatingOrganisationId: 1,
      partnerOrganisationId: 2,
      type: TransferAgreementType.SendingTo,
      validFrom: new Date().toISOString().substring(0, 10),
      validUntil: undefined,
      initiatingOrganisationBaseIds: [1],
      partnerOrganisationBaseIds: undefined,
      comment: "",
    },
  },
  result: {
    data: {
      createTransferAgreement: {
        id: 1,
      },
    },
  },
};

const mutationNetworkError = {
  request: {
    query: CREATE_AGREEMENT_MUTATION,
    variables: {
      initiatingOrganisationId: 1,
      partnerOrganisationId: 2,
      type: TransferAgreementType.Bidirectional,
      validFrom: new Date().toISOString().substring(0, 10),
      validUntil: undefined,
      initiatingOrganisationBaseIds: [1],
      partnerOrganisationBaseIds: undefined,
      comment: "",
    },
  },
  error: new Error(),
};

// Test case 4.1.1
it("4.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/bases/:baseId/transfers/agreements/create",
    initialUrl: "/bases/1/transfers/agreements/create",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: base1.id,
      },
    },
  });

  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  const title = await screen.findByRole("heading", { name: "New Transfer Agreement" });
  expect(title).toBeInTheDocument();
  // Test case 4.1.1.1 -  Content: Displays Source Bases Select Options
  const selectSourceBaseDropDown = screen.getByRole("combobox", { name: /boxaid bases/i });
  expect(selectSourceBaseDropDown).toBeInTheDocument();
  await user.click(selectSourceBaseDropDown);
  expect(await screen.findByText("Lesvos")).toBeInTheDocument();
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
    routePath: "/bases/:baseId/transfers/agreements/create",
    initialUrl: "/bases/1/transfers/agreements/create",
    mocks: [initialQuery, successfulMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: base1.id,
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
  expect(screen.getByText(/please choose a transfer type/i)).toBeInTheDocument();
  // Test case 4.1.2.4 - The "Valid from" field is optional, but only valid date formats should be entered
  const validFrom = screen.getByLabelText(/valid until/i) as HTMLInputElement;
  const testValueForValidFrom = new Date().toJSON().split("T")[0];
  fireEvent.change(validFrom, { target: { value: testValueForValidFrom } });
  expect(validFrom.value).toEqual(testValueForValidFrom);

  // Test case 4.1.2.5 - The "Valid until" field is optional, but only valid date formats should be entered
  await selectOptionInSelectField(user, /partner organisation/i, "BoxCare");
  const transferTypeSendingToLabel = screen.getByLabelText("Sending to");
  expect(transferTypeSendingToLabel).not.toBeChecked();
  await user.click(transferTypeSendingToLabel);
  expect(transferTypeSendingToLabel).toBeChecked();

  const validUntil = screen.getByLabelText(/valid until/i) as HTMLInputElement;
  const testInvalidValueForValidUntil = addDays(new Date(), -2).toJSON().split("T")[0];
  await user.type(validUntil, testInvalidValueForValidUntil);
  fireEvent.change(validUntil, { target: { value: testInvalidValueForValidUntil } });
  expect(validUntil.value).toEqual(testInvalidValueForValidUntil);
  await user.click(submitButton);
  expect(
    await screen.findByText(/please enter a greater date for the valid until/i),
  ).toBeInTheDocument();
});

// Test case 4.1.3
it("4.1.3 - Click on Submit Button", async () => {
  const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/bases/:baseId/transfers/agreements/create",
    initialUrl: "/bases/1/transfers/agreements/create",
    additionalRoute: "/bases/1/transfers/agreements",
    mocks: [initialQuery, successfulMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: base1.id,
      },
    },
  });

  const submitButton = await screen.findByRole("button", { name: /create agreement/i });
  expect(submitButton).toBeInTheDocument();

  // Test case 4.1.3.1 - Form data was valid and mutation was successful
  await selectOptionInSelectField(user, /partner organisation/i, "BoxCare");
  const transferTypeSendingToLabel = screen.getByLabelText("Sending to");
  expect(transferTypeSendingToLabel).not.toBeChecked();
  await user.click(transferTypeSendingToLabel);
  expect(transferTypeSendingToLabel).toBeChecked();
  await user.click(submitButton);
  expect(await screen.findByText(/successfully created a transfer agreement/i)).toBeInTheDocument();
  // Test case 4.1.3.2 - Redirect to Transfers Agreements Page
  expect(
    await screen.findByRole("heading", { name: "/bases/1/transfers/agreements" }),
  ).toBeInTheDocument();

  // Test case 4.1.3.3 - Form data was valid, but the mutation failed
  cleanup();
  render(<CreateTransferAgreementView />, {
    routePath: "/bases/:baseId/transfers/agreements/create",
    initialUrl: "/bases/1/transfers/agreements/create",
    mocks: [initialQuery, mutationNetworkError],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: base1.id,
      },
    },
  });

  const rerenderedSubmitButton = await screen.findByRole("button", { name: /create agreement/i });
  expect(rerenderedSubmitButton).toBeInTheDocument();
  await selectOptionInSelectField(user, /partner organisation/i, "BoxCare");
  const transferTypeSendingToAndReceivingFromLabel = screen.getByLabelText(
    "Sending to AND Receiving from",
  );
  expect(transferTypeSendingToAndReceivingFromLabel).not.toBeChecked();
  await user.click(transferTypeSendingToAndReceivingFromLabel);
  expect(transferTypeSendingToAndReceivingFromLabel).toBeChecked();
  await user.click(rerenderedSubmitButton);
  expect(await screen.findByText(/your changes could not be saved!/i)).toBeInTheDocument();
});

// Test case 4.1.4
it("4.1.4 - Failed to Fetch Initial Data", async () => {
  // const user = userEvent.setup();
  render(<CreateTransferAgreementView />, {
    routePath: "/bases/:baseId/transfers/agreements/create",
    initialUrl: "/bases/1/transfers/agreements/create",
    mocks: [initialQueryNetworkError],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: base1.id,
      },
    },
  });

  // Test case 4.1.4.1 - No Partner Organisations and Bases Data
  expect(
    await screen.findByText(
      /could not fetch Organisation and Base data! Please try reloading the page./i,
    ),
  ).toBeInTheDocument();
});
