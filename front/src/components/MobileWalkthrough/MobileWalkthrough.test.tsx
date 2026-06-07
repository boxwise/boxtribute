import { it, expect, vi, beforeEach } from "vitest";
import { screen, render, fireEvent, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { MobileWalkthroughProvider, MobileWalkthrough } from "components/MobileWalkthrough";

vi.mock("@auth0/auth0-react");

const mockedUseAuth0 = vi.mocked(useAuth0);

function renderMobileWalkthrough() {
  mockAuthenticatedUser(mockedUseAuth0, "test@example.com");
  return render(
    <MobileWalkthroughProvider>
      <MobileWalkthrough />
    </MobileWalkthroughProvider>,
    { routePath: "/bases/:baseId", initialUrl: "/bases/1" },
  );
}

beforeEach(() => {
  localStorage.clear();
});

it("MobileWalkthrough - shows welcome screen on first visit", async () => {
  renderMobileWalkthrough();
  expect(await screen.findByText(/Welcome to Boxtribute/i)).toBeInTheDocument();
  expect(screen.getByTestId("mobile-walkthrough-start")).toBeInTheDocument();
  expect(screen.getByTestId("mobile-walkthrough-skip-welcome")).toBeInTheDocument();
});

it("MobileWalkthrough - does NOT show welcome on subsequent visits", () => {
  localStorage.setItem(
    "boxtribute_mobile_walkthrough_anonymous",
    JSON.stringify({ hasSeenWelcome: true }),
  );
  renderMobileWalkthrough();
  expect(screen.queryByText(/Welcome to Boxtribute/i)).not.toBeInTheDocument();
});

it("MobileWalkthrough - Skip on welcome closes the walkthrough", async () => {
  renderMobileWalkthrough();
  const skipBtn = await screen.findByTestId("mobile-walkthrough-skip-welcome");
  fireEvent.click(skipBtn);
  await waitFor(() => expect(screen.queryByText(/Welcome to Boxtribute/i)).not.toBeInTheDocument());
});

it("MobileWalkthrough - Start moves to first instruction slide", async () => {
  renderMobileWalkthrough();
  const startBtn = await screen.findByTestId("mobile-walkthrough-start");
  fireEvent.click(startBtn);
  expect(await screen.findByText(/Scan any box, instantly/i)).toBeInTheDocument();
  expect(screen.getByTestId("mobile-walkthrough-skip")).toBeInTheDocument();
});

it("MobileWalkthrough - Next button advances through slides", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));

  // Slide 1 is visible
  expect(await screen.findByText(/Scan any box, instantly/i)).toBeInTheDocument();

  // Advance to slide 2
  fireEvent.click(screen.getByTestId("mobile-walkthrough-next"));
  expect(await screen.findByText(/Find and update boxes/i)).toBeInTheDocument();
});

it("MobileWalkthrough - Prev button goes back", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));
  fireEvent.click(screen.getByTestId("mobile-walkthrough-next"));
  expect(await screen.findByText(/Find and update boxes/i)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId("mobile-walkthrough-prev"));
  expect(await screen.findByText(/Scan any box, instantly/i)).toBeInTheDocument();
});

it("MobileWalkthrough - Skip on instruction slide closes the walkthrough", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-skip"));
  await waitFor(() =>
    expect(screen.queryByTestId("mobile-walkthrough-skip")).not.toBeInTheDocument(),
  );
});

it("MobileWalkthrough - reaching the last slide and clicking Next shows final screen", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));

  // Click Next through all slides (slides.length clicks to go from slide 0 → done)
  const { default: slides } = await import("components/MobileWalkthrough/slides");
  for (let i = 0; i < slides.length; i++) {
    fireEvent.click(screen.getByTestId("mobile-walkthrough-next"));
  }

  expect(await screen.findByText(/You are all set/i)).toBeInTheDocument();
  expect(screen.getByTestId("mobile-walkthrough-close")).toBeInTheDocument();
  expect(screen.getByTestId("mobile-walkthrough-replay")).toBeInTheDocument();
});

it("MobileWalkthrough - Close on final screen dismisses the walkthrough", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));

  const { default: slides } = await import("components/MobileWalkthrough/slides");
  for (let i = 0; i < slides.length; i++) {
    fireEvent.click(screen.getByTestId("mobile-walkthrough-next"));
  }

  fireEvent.click(await screen.findByTestId("mobile-walkthrough-close"));
  await waitFor(() => expect(screen.queryByText(/You are all set/i)).not.toBeInTheDocument());
});

it("MobileWalkthrough - Replay from final screen restarts instruction slides", async () => {
  renderMobileWalkthrough();
  fireEvent.click(await screen.findByTestId("mobile-walkthrough-start"));

  const { default: slides } = await import("components/MobileWalkthrough/slides");
  for (let i = 0; i < slides.length; i++) {
    fireEvent.click(screen.getByTestId("mobile-walkthrough-next"));
  }

  fireEvent.click(await screen.findByTestId("mobile-walkthrough-replay"));
  expect(await screen.findByText(/Scan any box, instantly/i)).toBeInTheDocument();
});
