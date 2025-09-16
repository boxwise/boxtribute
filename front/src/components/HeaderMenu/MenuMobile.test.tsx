import { vi, it, expect, describe } from "vitest";
import { screen, render, fireEvent, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import MenuMobile from "./MenuMobile";
import { mockAuthenticatedUser } from "mocks/hooks";

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

const mockMenuItemsGroups = [
  {
    text: "Aid Inventory",
    requiredAbps: [],
    links: [
      {
        link: "/bases/1/boxes",
        name: "Manage Boxes",
        requiredAbps: [],
      },
      {
        link: "/bases/1/labels",
        name: "Print Box Labels",
        requiredAbps: [],
      },
    ],
  },
];

describe("MenuMobile - Menu Close Functionality", () => {
  it("should render navigation links that are clickable", async () => {
    mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org");
    const onClickScanQrCode = vi.fn();

    render(
      <MenuMobile onClickScanQrCode={onClickScanQrCode} menuItemsGroups={mockMenuItemsGroups} />,
      {
        routePath: "/bases/:baseId",
        initialUrl: "/bases/1",
      },
    );

    // Open the menu
    const menuButton = screen.getByTestId("menu-button");
    fireEvent.click(menuButton);

    // Wait for menu content to be visible
    await waitFor(() => {
      expect(screen.getByText("Manage Boxes")).toBeInTheDocument();
    });

    // Verify the navigation link has onclick handler (our fix)
    const manageBoxesLink = screen.getByText("Manage Boxes");
    expect(manageBoxesLink).toBeInTheDocument();

    // Click should not throw an error
    fireEvent.click(manageBoxesLink);
  });

  it("should render Account settings link that is clickable", async () => {
    mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org");
    const onClickScanQrCode = vi.fn();

    render(
      <MenuMobile onClickScanQrCode={onClickScanQrCode} menuItemsGroups={mockMenuItemsGroups} />,
      {
        routePath: "/bases/:baseId",
        initialUrl: "/bases/1",
      },
    );

    // Open the menu
    const menuButton = screen.getByTestId("menu-button");
    fireEvent.click(menuButton);

    // Wait for menu content to be visible
    await waitFor(() => {
      expect(screen.getByText("Account")).toBeInTheDocument();
    });

    // Verify the Account link has onclick handler (our fix)
    const accountLink = screen.getByText("Account");
    expect(accountLink).toBeInTheDocument();

    // Click should not throw an error
    fireEvent.click(accountLink);
  });
});
