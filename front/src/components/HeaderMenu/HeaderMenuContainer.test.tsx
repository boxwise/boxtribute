import { vi, it, expect } from "vitest";
import { screen, render } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import HeaderMenuContainer from "components/HeaderMenu/HeaderMenuContainer";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";

vi.mock("@auth0/auth0-react");
vi.mock("components/QrReader/components/QrReaderScanner");
const mockedUseAuth0 = vi.mocked(useAuth0);
const mockedQrReader = vi.mocked(QrReaderScanner);

it("1.3.1 - Menus are available to the user depending on ABPs - Nothing", async () => {
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");

  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  expect(screen.queryByRole("button", { name: /Statistics/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Aid Inventory/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Coordinator Admin/i })).not.toBeInTheDocument();
}, 10000);

it("1.3.2 - Menus are available to the user depending on ABPs - Aid Inventory", async () => {
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  mockAuthenticatedUser(
    mockedUseAuth0,
    "dev_volunteer@boxaid.org",
    ["view_inventory", "view_shipments", "view_beneficiary_graph", "create_label"],
    "3",
  );

  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  expect(screen.getByRole("button", { name: /Statistics/i })).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Aid Inventory/i })).toBeInTheDocument();
  expect(screen.getByText(/Print Box Labels/i)).toBeInTheDocument();
  expect(screen.queryByText(/Manage Boxes/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Classic Manage Boxes/i)).not.toBeInTheDocument();

  expect(screen.queryByRole("button", { name: /Coordinator Admin/i })).not.toBeInTheDocument();
}, 10000);

it("1.3.3 - Menus are available to the user depending on ABPs - Aid Inventory w/ submenus Stock Planning, Manage Boxes", async () => {
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  mockAuthenticatedUser(
    mockedUseAuth0,
    "dev_volunteer@boxaid.org",
    ["create_label", "manage_inventory"],
    "0",
  );

  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  expect(screen.queryByRole("button", { name: /Statistics/i })).not.toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Aid Inventory/i })).toBeInTheDocument();
  expect(screen.getByText(/Print Box Labels/i)).toBeInTheDocument();
  expect(screen.getByText(/Classic Manage Boxes/i)).toBeInTheDocument();

  expect(screen.queryByRole("button", { name: /Coordinator Admin/i })).not.toBeInTheDocument();
}, 10000);

it("1.3.4 - Menus available to the user depending on ABPs - Coordinator Admin", async () => {
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  mockAuthenticatedUser(
    mockedUseAuth0,
    "dev_volunteer@boxaid.org",
    ["view_inventory", "view_shipments", "view_beneficiary_graph", "manage_volunteers"],
    "3",
  );

  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  expect(screen.getByRole("button", { name: /Statistics/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Aid Inventory/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Coordinator Admin/i })).toBeInTheDocument();
}, 10000);

it("1.3.5 - Menus available to the user depending on ABPs - Coordinator Admin w/ submenus Manage Products, Edit Warehouses", async () => {
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  mockAuthenticatedUser(
    mockedUseAuth0,
    "dev_volunteer@boxaid.org",
    [
      "view_inventory",
      "view_shipments",
      "view_beneficiary_graph",
      "manage_volunteers",
      "manage_products",
      "manage_warehouses",
    ],
    "4",
  );

  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  expect(screen.getByRole("button", { name: /Statistics/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Aid Inventory/i })).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Coordinator Admin/i })).toBeInTheDocument();
  expect(screen.getByText(/Manage Products/i)).toBeInTheDocument();
  expect(screen.getByText(/Edit Warehouses/i)).toBeInTheDocument();
}, 10000);
