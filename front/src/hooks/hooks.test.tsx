import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import { useHandleLogout } from "./hooks";

const { resetHeapIdentity } = vi.hoisted(() => ({
  resetHeapIdentity: vi.fn(),
}));

vi.mock("@auth0/auth0-react");
vi.mock("@boxtribute/shared-components/statviz/utils/analytics/heap", () => ({
  resetHeapIdentity,
}));

const mockedUseAuth0 = vi.mocked(useAuth0);

function LogoutButton() {
  const { handleLogout } = useHandleLogout();

  return <button onClick={handleLogout}>Logout</button>;
}

describe("useHandleLogout", () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("resets Heap identity before Auth0 logout in development", async () => {
    const logout = vi.fn();
    mockedUseAuth0.mockReturnValue({
      logout,
      user: undefined,
    } as ReturnType<typeof useAuth0>);
    vi.stubEnv("FRONT_ENVIRONMENT", "development");

    const user = userEvent.setup();
    render(<LogoutButton />, {
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

  it("resets Heap identity before redirecting in non-development environments", async () => {
    mockedUseAuth0.mockReturnValue({
      logout: vi.fn(),
      user: undefined,
    } as ReturnType<typeof useAuth0>);
    vi.stubEnv("FRONT_ENVIRONMENT", "staging");
    vi.stubEnv("FRONT_OLD_APP_BASE_URL", "https://old.example.test");

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/" },
    });

    const user = userEvent.setup();
    render(<LogoutButton />, {
      routePath: "/",
      initialUrl: "/",
    });

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(resetHeapIdentity).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("https://old.example.test/index.php?action=logoutfromv2");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
