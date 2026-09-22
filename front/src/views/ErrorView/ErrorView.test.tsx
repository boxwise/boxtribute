import { afterEach, expect, it, vi } from "vitest";
import { render, screen } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import ErrorView from "./ErrorView";

const { resetHeapIdentity } = vi.hoisted(() => ({
  resetHeapIdentity: vi.fn(),
}));

vi.mock("@auth0/auth0-react");
vi.mock("@boxtribute/shared-components/statviz/utils/analytics/heap", () => ({
  resetHeapIdentity,
}));

const mockedUseAuth0 = vi.mocked(useAuth0);

afterEach(() => {
  vi.clearAllMocks();
});

it("resets Heap identity before logging out", async () => {
  const logout = vi.fn();
  mockedUseAuth0.mockReturnValue({
    logout,
  } as ReturnType<typeof useAuth0>);

  const user = userEvent.setup();
  render(<ErrorView error="Boom" />, {
    routePath: "/",
    initialUrl: "/",
  });

  await user.click(screen.getByRole("button", { name: "Logout" }));

  expect(resetHeapIdentity).toHaveBeenCalledOnce();
  expect(logout).toHaveBeenCalledOnce();
  expect(resetHeapIdentity.mock.invocationCallOrder[0]).toBeLessThan(
    logout.mock.invocationCallOrder[0],
  );
});
