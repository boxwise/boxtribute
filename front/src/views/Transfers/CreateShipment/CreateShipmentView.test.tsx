import { vi, it, describe, expect } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { organisation1, organisation2 } from "mocks/organisations";
import { acceptedTransferAgreement } from "mocks/transferAgreements";
import { userEvent } from "@testing-library/user-event";
import { assertOptionsInSelectField, selectOptionInSelectField } from "tests/helpers";
import { base1, base2 } from "mocks/bases";
import { ShipmentState } from "types/generated/graphql";
import { generateMockShipment } from "mocks/shipments";
import { cache } from "queries/cache";
import { gql } from "@apollo/client";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import CreateShipmentView, {
  ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
  CREATE_SHIPMENT_MUTATION,
} from "./CreateShipmentView";
import { SHIPMENT_BY_ID_QUERY } from "../ShipmentView/ShipmentView";
import { FakeGraphQLError } from "mocks/functions";

vi.setConfig({ testTimeout: 12_000 });

const initialQuery = {
  request: {
    query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: "1",
        name: "Lesvos",
        organisation: {
          __typename: "Organisation",
          id: "1",
          name: "BoxAid",
        },
      },
      transferAgreements: [acceptedTransferAgreement],
    },
  },
};

const initialQueryWithoutAgreement = {
  request: {
    query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: "1",
        name: "Lesvos",
        organisation: {
          __typename: "Organisation",
          id: "1",
          name: "BoxAid",
        },
      },
      transferAgreements: [],
    },
  },
};
const initialWithoutBoxQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({ state: ShipmentState.Preparing, hasBoxes: false }),
    },
  },
};

const initialQueryNetworkError = {
  request: {
    query: ALL_ACCEPTED_TRANSFER_AGREEMENTS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    errors: [new FakeGraphQLError()],
  },
};

const successfulMutation = {
  request: {
    query: CREATE_SHIPMENT_MUTATION,
    variables: {
      transferAgreementId: 1,
      sourceBaseId: 1,
      targetBaseId: 3,
    },
  },
  result: {
    data: {
      createShipment: {
        ...generateMockShipment({ state: ShipmentState.Preparing, hasBoxes: false }),
      },
    },
  },
};

const mutationNetworkError = {
  request: {
    query: CREATE_SHIPMENT_MUTATION,
    variables: {
      transferAgreementId: 1,
      sourceBaseId: 1,
      targetBaseId: 3,
    },
  },
  error: new Error(),
};

const mutationGraphQLError = {
  request: {
    query: CREATE_SHIPMENT_MUTATION,
    variables: {
      transferAgreementId: 1,
      sourceBaseId: 1,
      targetBaseId: 3,
    },
  },
  result: {
    errors: [new FakeGraphQLError()],
  },
};

// Test case 4.3.1
it("4.3.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/1/transfers/shipments/create",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: { id: base1.id, name: base1.name },
      },
    },
  });

  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  const title = await screen.findByRole("heading", { name: "New Shipment" });
  expect(title).toBeInTheDocument();
  // Test case 4.3.1.1 - Content: Displays Source Base Label
  expect(screen.getAllByText(/boxaid - lesvos/i)[0]).toBeInTheDocument();
  // Test case 4.3.1.2 - Content: Displays Partner Orgs Select Options
  await assertOptionsInSelectField(user, /organisation/i, [/boxcare/i], title);
  await selectOptionInSelectField(user, /organisation/i, "BoxCare");
  expect(await screen.findByText("BoxCare")).toBeInTheDocument();
  // Test case 4.3.1.3 - Content: Displays Partner Bases Select Options When Partner Organisation Selected
  await assertOptionsInSelectField(user, /base/i, [/samos/i, /thessaloniki/i, /athens/i], title);
  await selectOptionInSelectField(user, /base/i, "Samos");

  // Breadcrumbs are there
  expect(screen.getByRole("link", { name: /back to manage shipments/i })).toBeInTheDocument();
});

// Test case 4.3.2
it("4.3.2 - Input Validations", async () => {
  const user = userEvent.setup();
  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/1/transfers/shipments/create",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: { id: base1.id, name: base1.name },
      },
    },
  });

  const submitButton = await screen.findByRole("button", { name: /start new shipment/i });
  expect(submitButton).toBeInTheDocument();
  user.click(submitButton);
  // Test case 4.3.2.1 - Partner Organisation SELECT field cannot be empty
  expect((screen.getByLabelText(/organisation/i) as HTMLInputElement).value).toEqual("");
  expect(screen.getByText(/please select an organisation/i)).toBeInTheDocument();
  // Test case 4.3.2.2 - Partner Organisation Base SELECT field cannot be empty
  expect((screen.getByLabelText(/base/i) as HTMLInputElement).value).toEqual("");
  expect(screen.getAllByText(/please select a base/i)[0]).toBeInTheDocument();

  expect((await screen.findAllByText(/required/i)).length).toEqual(2);
});

// Test case 4.3.3
it("4.3.3 (4.3.3.1 and 4.3.3.2) - Click on Submit Button", async () => {
  const user = userEvent.setup();

  // modify the cache
  cache.modify({
    fields: {
      shipments(existingShipments = []) {
        const newShipmentRef = cache.writeFragment({
          data: successfulMutation.result.data,
          fragment: gql`
            fragment NewShipment on Shipment {
              id
            }
          `,
        });
        return existingShipments.concat(newShipmentRef);
      },
    },
  });

  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/1/transfers/shipments/create",
    additionalRoute: "/bases/1/transfers/shipments/1",
    mocks: [initialQuery, successfulMutation, initialWithoutBoxQuery],
    addTypename: true,
    cache,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: { id: base1.id, name: base1.name },
      },
    },
  });

  const title = await screen.findByRole("heading", { name: "New Shipment" });
  expect(title).toBeInTheDocument();

  // Test case 4.3.3.1 - Form data was valid and mutation was successful
  const submitButton = await screen.findByRole("button", { name: /start new shipment/i });
  expect(submitButton).toBeInTheDocument();

  await assertOptionsInSelectField(user, /organisation/i, [/boxcare/i], title);
  await selectOptionInSelectField(user, /organisation/i, "BoxCare");
  expect(await screen.findByText("BoxCare")).toBeInTheDocument();
  await assertOptionsInSelectField(user, /base/i, [/samos/i, /thessaloniki/i, /athens/i], title);
  await selectOptionInSelectField(user, /base/i, "Samos");
  expect(await screen.findByText("Samos")).toBeInTheDocument();

  await user.click(submitButton);
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/successfully created a new shipment/i),
      }),
    ),
  );

  // Test case 4.3.3.2 - Redirect to Transfers Shipments Page
  expect(
    await screen.findByRole("heading", { name: "/bases/1/transfers/shipments/1" }),
  ).toBeInTheDocument();
});

// Test case 4.3.3.3
it("4.3.3.3 - Form data was valid, but the mutation failed", async () => {
  const user = userEvent.setup();
  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/1/transfers/shipments/create",
    mocks: [initialQuery, mutationNetworkError],
    addTypename: true,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: { id: base1.id, name: base1.name },
      },
    },
  });

  // Test case 4.3.3.3 - Form data was valid, but the mutation failed
  const pageTitle = await screen.findByRole("heading", { name: "New Shipment" });
  expect(pageTitle).toBeInTheDocument();

  const submitStartButton = await screen.findByRole("button", { name: /start new shipment/i });
  expect(submitStartButton).toBeInTheDocument();

  await assertOptionsInSelectField(user, /organisation/i, [/boxcare/i], pageTitle);
  await selectOptionInSelectField(user, /organisation/i, "BoxCare");
  expect(await screen.findByText("BoxCare")).toBeInTheDocument();
  await selectOptionInSelectField(user, /base/i, "Samos");
  expect(await screen.findByText("Samos")).toBeInTheDocument();
  await user.click(submitStartButton);
  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/error while trying to create a new shipment/i),
      }),
    ),
  );
});

// Test case 4.3.3.4
it("4.3.3.4 - Form data was valid, but the mutation response has errors", async () => {
  const user = userEvent.setup();
  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/1/transfers/shipments/create",
    mocks: [initialQuery, mutationGraphQLError],
    addTypename: true,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: { id: base1.id, name: base1.name },
      },
    },
  });

  // Test case 4.3.3.4 - Form data was valid, but the mutation response has errors
  const shipmentPageTitle = await screen.findByRole("heading", { name: "New Shipment" });
  expect(shipmentPageTitle).toBeInTheDocument();

  const submitShipmentStartButton = await screen.findByRole("button", {
    name: /Start New Shipment/i,
  });
  expect(submitShipmentStartButton).toBeInTheDocument();

  await assertOptionsInSelectField(user, /organisation/i, [/boxcare/i], shipmentPageTitle);
  await selectOptionInSelectField(user, /organisation/i, "BoxCare");
  expect(await screen.findByText("BoxCare")).toBeInTheDocument();
  await selectOptionInSelectField(user, /base/i, "Samos");
  expect(await screen.findByText("Samos")).toBeInTheDocument();
  await user.click(submitShipmentStartButton);
  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/error while trying to create a new shipment/i),
      }),
    ),
  );
});

// TODO: can't make this to work inside the test environment.
it.skip("4.3.3.5 - Click on Submit Button - Intra-org shipment ", async () => {
  const user = userEvent.setup();

  // modify the cache
  cache.modify({
    fields: {
      shipments(existingShipments = []) {
        const newShipmentRef = cache.writeFragment({
          data: successfulMutation.result.data,
          fragment: gql`
            fragment NewShipment on Shipment {
              id
            }
          `,
        });
        return existingShipments.concat(newShipmentRef);
      },
    },
  });

  render(<CreateShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/create",
    initialUrl: "/bases/2/transfers/shipments/create",
    additionalRoute: "/bases/2/transfers/shipments/1",
    mocks: [initialQuery, successfulMutation, initialWithoutBoxQuery],
    addTypename: true,
    cache,
    globalPreferences: {
      dispatch: vi.fn(),
      globalPreferences: {
        organisation: { id: organisation2.id, name: organisation2.name },
        availableBases: organisation2.bases,
        selectedBase: { id: base2.id, name: base2.name },
      },
    },
  });

  const title = await screen.findByRole("heading", { name: "New Shipment" });
  expect(title).toBeInTheDocument();

  const intraOrgTab = await screen.findByRole("tab", { name: /BoxAid - Lesvos/i });
  expect(intraOrgTab).toBeInTheDocument();
  await user.click(intraOrgTab);

  // Since this base is the only other base for this test org, it will be already selected.
  expect(await screen.findByText("Base Bar")).toBeInTheDocument();

  // Test case 4.3.3.1 - Form data was valid and mutation was successful
  const submitButton = await screen.findByRole("button", { name: /start new shipment/i });
  expect(submitButton).toBeInTheDocument();

  await user.click(submitButton);

  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/successfully created a new shipment/i),
      }),
    ),
  );

  // Test case 4.3.3.2 - Redirect to Transfers Shipments Page
  expect(
    await screen.findByRole("heading", { name: "/bases/1/transfers/shipments/1" }),
  ).toBeInTheDocument();
});

// Test case 4.3.4
describe("4.3.4 - Failed to Fetch Initial Data", () => {
  it("4.3.4.1 - No Partner Organisations and Bases Data", async () => {
    render(<CreateShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipment/create",
      initialUrl: "/bases/1/transfers/shipment/create",
      mocks: [initialQueryNetworkError],
      addTypename: true,
      globalPreferences: {
        dispatch: vi.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base1.id, name: base1.name },
        },
      },
    });

    // Test case 4.3.4.1 - No Partner Organisations and Bases Data
    expect(
      await screen.findByText(
        /could not fetch Organisation and Base data! Please try reloading the page./i,
      ),
    ).toBeInTheDocument();
  });

  // Test case 4.3.4.2
  it("4.3.4.2 - No Agreements Found", async () => {
    render(<CreateShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipment/create",
      initialUrl: "/bases/1/transfers/shipment/create",
      mocks: [initialQueryWithoutAgreement],
      addTypename: true,
      globalPreferences: {
        dispatch: vi.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base1.id, name: base1.name },
        },
      },
    });

    // Test case 4.3.4.2 - No Accepeted Agreements Found
    expect(
      await screen.findByText(
        /you must have an agreement with a network partner before creating a shipment\./i,
      ),
    ).toBeInTheDocument();
  });
});
