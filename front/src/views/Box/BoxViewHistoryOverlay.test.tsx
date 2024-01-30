import { vi, beforeEach, it, expect, describe } from "vitest";
import { screen, render } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { cache } from "queries/cache";

import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { organisation1 } from "mocks/organisations";

import { BoxState } from "types/generated/graphql";
import { history1, history2 } from "mocks/histories";
import { generateMockBox } from "mocks/boxes";
import { mockMatchMediaQuery } from "mocks/functions";
import BTBox from "./BoxView";

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
    // setting the screensize to
    mockMatchMediaQuery(true);
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
        dispatch: vi.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: organisation1.bases[0],
        },
      },
    });

    const heading = await screen.findByRole("heading", { name: /box 123/i });
    expect(heading).toBeInTheDocument();

    const showHistoryButton = await screen.findByRole("button", {
      name: /show detail history/i,
    });

    expect(showHistoryButton).toBeInTheDocument();
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
        dispatch: vi.fn(),
        globalPreferences: {
          organisation: { id: organisation1.id, name: organisation1.name },
          availableBases: organisation1.bases,
          selectedBase: organisation1.bases[0],
        },
      },
    });

    const heading = await screen.findByRole("heading", { name: /box 123/i });
    expect(heading).toBeInTheDocument();

    const historyButton = await screen.findByRole("button", {
      name: /show detail history/i,
    });

    expect(historyButton).toBeInTheDocument();

    await user.click(historyButton);

    const banner = await screen.findByRole("banner");

    expect(banner).toBeInTheDocument();
    expect(screen.getByText(/jan 14, 2023/i)).toBeInTheDocument();
    expect(
      screen.getByText(/dev coordinator changed box location from wh men to wh women/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/jan 12, 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/dev coordinator created record/i)).toBeInTheDocument();
  }, 10000);
});
