import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import MatomoProviderWithHistory from "./MatomoProviderWithHistory";

const matomoWindow = window as Window & { _paq?: unknown[][] };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete matomoWindow._paq;
});

function renderProvider() {
  return render(
    <MemoryRouter initialEntries={["/bases/1?private=initial#secret"]}>
      <MatomoProviderWithHistory>
        <Link to="/bases/2?private=next#confidential">Next page</Link>
        <Link to="/bases/1?private=changed#changed">Change query and hash</Link>
      </MatomoProviderWithHistory>
    </MemoryRouter>,
  );
}

it("disables tracking in Vitest without loading matomo.js", () => {
  expect(import.meta.env.MODE).toBe("test");
  vi.stubEnv("DEV", false);
  const createElement = vi.spyOn(document, "createElement");

  renderProvider();

  expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
  expect(createElement).not.toHaveBeenCalledWith("script");
  expect(matomoWindow._paq).toBeUndefined();
});

it("disables tracking in local development", () => {
  vi.stubEnv("MODE", "development");
  vi.stubEnv("DEV", true);
  const createElement = vi.spyOn(document, "createElement");

  renderProvider();

  expect(createElement).not.toHaveBeenCalledWith("script");
  expect(matomoWindow._paq).toBeUndefined();
});

it("tracks pathname-only page views on navigation with link tracking disabled", () => {
  vi.stubEnv("MODE", "production");
  vi.stubEnv("DEV", false);

  renderProvider();

  expect(matomoWindow._paq).toEqual(
    expect.arrayContaining([
      ["setTrackerUrl", "https://boxtribute.matomo.cloud/matomo.php"],
      ["setSiteId", 2],
      ["setCustomUrl", `${window.location.origin}/bases/1`],
      ["trackPageView"],
    ]),
  );
  expect(matomoWindow._paq).not.toContainEqual(["enableLinkTracking"]);
  expect(matomoWindow._paq?.filter(([command]) => command === "trackPageView")).toHaveLength(1);

  fireEvent.click(screen.getByRole("link", { name: "Change query and hash" }));
  expect(matomoWindow._paq?.filter(([command]) => command === "trackPageView")).toHaveLength(1);

  fireEvent.click(screen.getByRole("link", { name: "Next page" }));
  expect(matomoWindow._paq?.filter(([command]) => command === "setCustomUrl")).toEqual([
    ["setCustomUrl", `${window.location.origin}/bases/1`],
    ["setCustomUrl", `${window.location.origin}/bases/2`],
  ]);
  expect(matomoWindow._paq?.filter(([command]) => command === "trackPageView")).toHaveLength(2);
});
