import BoxCreateView, { ALL_PRODUCTS_QUERY } from "./BoxCreateView";
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import { render } from "utils/test-utils";

const allProductsQueryMock = {
  request: {
    query: ALL_PRODUCTS_QUERY,
  },
  result: {
    data: {
      products: {
        elements: [
          {
            __typename: "Product",
            id: 1,
            name: "Thick Blanket",
            gender: "FEMALE",
            category: {
              name: "Blankets",
            },
            sizeRange: {
              label: "One Size",
            },
          },
        ],
      },
    },
  },
};

const waitTillLoadingIsDone = async () => {
  await waitFor(() => {
    const loadingInfo = screen.queryByText("Loading...");
    expect(loadingInfo).toBeNull();
  });
};

describe("Box Create View", () => {
  describe("without a qr code in the url", () => {
    const mocks = [allProductsQueryMock];

    beforeEach(() => {
      render(<BoxCreateView />, {
        routePath: "/bases/:baseId/boxes/new",
        initialUrl: "/bases/1/boxes/new",
        mocks,
      });
    });

    it("renders with an initial 'Loading...'", () => {
      const loadingInfo = screen.getByText("Loading...");
      expect(loadingInfo).toBeInTheDocument();
    });

    it("eventually renders the main view with the heading", async () => {
      await waitFor(waitTillLoadingIsDone);
      const createNewBoxHeader = await screen.getByRole("heading", {
        level: 2,
      });
      expect(createNewBoxHeader).toBeInTheDocument();
      expect(createNewBoxHeader).toHaveTextContent("Create new Box");
    });
  });
  describe("with a qr code in the url", () => {
    const mocks = [allProductsQueryMock];

    beforeEach(() => {
      render(<BoxCreateView />, {
        routePath: "/bases/:baseId/boxes/new",
        initialUrl: "/bases/1/boxes/new?qrCode=1234",
        mocks,
      });
    });

    it("shows the qr code given by the url search paramt", async () => {
      await waitFor(waitTillLoadingIsDone);
      const createNewBoxHeader = await screen.getByText("QR Code: 1234")
      expect(createNewBoxHeader).toBeInTheDocument();
    });
  });
});
