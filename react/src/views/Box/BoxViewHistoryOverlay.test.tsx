/* eslint-disable */
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { cache } from "queries/cache";

import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";

import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { organisation1 } from "mocks/organisations";
import BTBox from "./BoxView";

import { BoxState } from "types/generated/graphql";
import { history1, history2 } from "mocks/histories";
import { generateMockBox } from "mocks/boxes";

const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");

cache.reset();

const initialQueryForBoxWithHistory = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "123",
    },
    notifyOnNetworkStatusChange: true,
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "123",
        state: BoxState.InStock,
        histories: [history1, history2],
      }),
    },
  },
};

// Test case 3.1.12
describe("3.1.12 - Box HistoryOverlay on BoxView", () => {
  beforeEach(() => {
    // we need to mock matchmedia
    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    const mockedUseErrorHandling = jest.mocked(useErrorHandling);
    mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
    const mockedUseNotification = jest.mocked(useNotification);
    mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
  });

  // Test case 3.1.12.1
  it("3.1.12.1 - When more than one entry is available displays history icon", async () => {
    render(<BTBox />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/1/boxes/123",
      additionalRoute: "/bases/1/shipment/1",
      mocks: [initialQueryForBoxWithHistory],
      addTypename: true,
      cache,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: organisation1.bases[0],
        },
      },
    });

    await waitFor(async () => {
      expect(await screen.getByRole("heading", { name: /box 123/i })).toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(
        await screen.getByRole("button", {
          name: /show detail history/i,
        }),
      ).toBeInTheDocument();
    });
  }, 10000);

  // Test case 3.1.12.2
  it("3.1.12.2 - Click on history icons opens history overlay", async () => {
    const user = userEvent.setup();

    render(<BTBox />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/1/boxes/123",
      additionalRoute: "/bases/1/shipment/1",
      mocks: [initialQueryForBoxWithHistory],
      addTypename: true,
      cache,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: organisation1.bases[0],
        },
      },
    });

    await waitFor(async () => {
      expect(await screen.getByRole("heading", { name: /box 123/i })).toBeInTheDocument();
    });

    const historyButton = await screen.getByRole("button", {
      name: /show detail history/i,
    });

    await waitFor(async () => {
      expect(historyButton).toBeInTheDocument();
    });

    await user.click(historyButton);

    await waitFor(async () => {
      expect(await screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByText(/jan 14, 2023/i)).toBeInTheDocument();
      expect(
        screen.getByText(/dev coordinator changed box location from wh men to wh women/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/jan 12, 2023/i)).toBeInTheDocument();
      expect(screen.getByText(/dev coordinator created record/i)).toBeInTheDocument();
    });
  }, 10000);
});
