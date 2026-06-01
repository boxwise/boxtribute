import { it, expect, vi, beforeEach } from "vitest";
import { screen, render, fireEvent, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { WalkthroughProvider, Walkthrough } from "components/Walkthrough";

vi.mock("@auth0/auth0-react");
// react-joyride interacts heavily with DOM geometry not available in jsdom; mock it
vi.mock("react-joyride", () => ({
  Joyride: () => null,
  STATUS: { FINISHED: "finished", SKIPPED: "skipped" },
  EVENTS: { STEP_AFTER: "step:after" },
  ACTIONS: { NEXT: "next", PREV: "prev", CLOSE: "close", SKIP: "skip" },
}));

const mockedUseAuth0 = vi.mocked(useAuth0);

function renderWalkthrough(roles = "administrator") {
  mockAuthenticatedUser(mockedUseAuth0, "test@example.com", ["be_user"], "0", roles);
  return render(
    <WalkthroughProvider>
      <Walkthrough />
    </WalkthroughProvider>,
    { routePath: "/bases/:baseId", initialUrl: "/bases/1" },
  );
}

beforeEach(() => {
  localStorage.clear();
});

it("Walkthrough - shows welcome modal on first visit", async () => {
  renderWalkthrough();
  expect(await screen.findByText(/Welcome to Boxtribute/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Start/i })).toBeInTheDocument();
});

it("Walkthrough - skipping welcome closes the walkthrough", async () => {
  renderWalkthrough();
  const closeBtn = await screen.findByRole("button", { name: /close/i });
  fireEvent.click(closeBtn);
  await waitFor(() => expect(screen.queryByText(/Welcome to Boxtribute/i)).not.toBeInTheDocument());
});

it("Walkthrough - does NOT show welcome on subsequent visits", async () => {
  // Simulate a returning user with hasSeenWelcome = true
  // mock user has no sub, so storageKey uses "anonymous"
  localStorage.setItem(
    "boxtribute_walkthrough_anonymous",
    JSON.stringify({ completedPaths: [], hasSeenWelcome: true }),
  );
  renderWalkthrough();
  // Welcome modal should NOT appear
  expect(screen.queryByText(/Welcome to Boxtribute/i)).not.toBeInTheDocument();
});

it("Walkthrough - clicking Start advances to path selection", async () => {
  renderWalkthrough();
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  expect(await screen.findByText(/Choose Your Path/i)).toBeInTheDocument();
});

it("Walkthrough - coordinator sees all 3 path options", async () => {
  renderWalkthrough("base_1_coordinator");
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  // Use full title text to avoid matching path 3 description which also contains "manage stock"
  expect(
    await screen.findByText(/How to manage stock & boxes/i, { selector: "p" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/How to register & support beneficiaries/i, { selector: "p" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/How to coordinate the whole operation/i, { selector: "p" }),
  ).toBeInTheDocument();
});

it("Walkthrough - warehouse volunteer does NOT see path 2 or 3", async () => {
  renderWalkthrough("base_1_warehouse_volunteer");
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  expect(
    await screen.findByText(/How to manage stock & boxes/i, { selector: "p" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/How to register & support beneficiaries/i, { selector: "p" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/How to coordinate the whole operation/i, { selector: "p" }),
  ).not.toBeInTheDocument();
});

it("Walkthrough - free shop volunteer sees path 1 and 2 but not 3", async () => {
  renderWalkthrough("base_1_free_shop_volunteer");
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  expect(
    await screen.findByText(/How to manage stock & boxes/i, { selector: "p" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/How to register & support beneficiaries/i, { selector: "p" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/How to coordinate the whole operation/i, { selector: "p" }),
  ).not.toBeInTheDocument();
});

it("Walkthrough - clicking Explore starts the tour path", async () => {
  renderWalkthrough();
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  const exploreButtons = await screen.findAllByRole("button", { name: /Explore/i });
  fireEvent.click(exploreButtons[0]);
  // Tour is now active (modal closed) - no skip/path indicator in simplified setup
  await waitFor(() => expect(screen.queryByText(/Choose Your Path/i)).not.toBeInTheDocument());
});

it("Walkthrough - completed path shows Completed + Replay buttons", async () => {
  // Pre-populate completed paths in localStorage
  // mock user has no sub, so storageKey uses "anonymous"
  localStorage.setItem(
    "boxtribute_walkthrough_anonymous",
    JSON.stringify({ completedPaths: ["path1"], hasSeenWelcome: false }),
  );
  renderWalkthrough();
  // Welcome modal opens, click Start to go to path selection
  const startBtn = await screen.findByRole("button", { name: /Start/i });
  fireEvent.click(startBtn);
  // Path 1 should now show Completed! and Replay
  expect(await screen.findByRole("button", { name: /Completed!/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Replay/i })).toBeInTheDocument();
});
