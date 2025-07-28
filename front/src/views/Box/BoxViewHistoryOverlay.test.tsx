import { beforeEach, it, expect, describe } from "vitest";
import { screen, render } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { cache } from "queries/cache";

import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { history1, history2, history3 } from "mocks/histories";
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
        state: "InStock",
        histories: [history1, history2, history3],
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
    });

    const heading = await screen.findByRole("heading", { name: /box 123/i });
    expect(heading).toBeInTheDocument();

    const showHistoryButton = await screen.findByRole("button", {
      name: /show detail history/i,
    });

    expect(showHistoryButton).toBeInTheDocument();
  }, 15000);

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
    expect(screen.getByText(/may 15, 2023/i)).toBeInTheDocument();
    expect(
      screen.getByText(/dev coordinator changed box location from wh men to wh women/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/jan 12, 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/dev coordinator created record/i)).toBeInTheDocument();
  }, 10000);

  // Test case 3.1.12.3
  it("3.1.12.3 - History entries are displayed in chronological order (newest first)", async () => {
    const user = userEvent.setup();

    render(<BTBox />, {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/1/boxes/123",
      additionalRoute: "/bases/1/shipment/1",
      mocks: [initialQueryForBoxWithHistory],
      addTypename: true,
      cache,
    });

    const heading = await screen.findByRole("heading", { name: /box 123/i });
    expect(heading).toBeInTheDocument();

    const historyButton = await screen.findByRole("button", {
      name: /show detail history/i,
    });

    await user.click(historyButton);

    const banner = await screen.findByRole("banner");
    expect(banner).toBeInTheDocument();

    // Get all date elements in the overlay - they should be ordered chronologically (newest first)
    // Note: formatDateKey formats dates with newlines, so we need to check for the right pattern
    const march2024 = screen.getByText(/mar\s*20,\s*2024/i);
    const may2023 = screen.getByText(/may\s*15,\s*2023/i);
    const jan2023 = screen.getByText(/jan\s*12,\s*2023/i);

    // Verify all dates are present
    expect(march2024).toBeInTheDocument();
    expect(may2023).toBeInTheDocument();
    expect(jan2023).toBeInTheDocument();

    // Verify that the 2024 entry appears before the 2023 entries
    // by checking the document position of the elements
    const march2024Position = march2024.compareDocumentPosition(may2023);
    const may2023Position = may2023.compareDocumentPosition(jan2023);

    // DOCUMENT_POSITION_FOLLOWING means the node appears after the reference node
    // So if march2024 is before may2023, compareDocumentPosition should return DOCUMENT_POSITION_FOLLOWING
    expect(march2024Position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(); // Mar 2024 before May 2023
    expect(may2023Position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(); // May 2023 before Jan 2023
  }, 10000);
});
