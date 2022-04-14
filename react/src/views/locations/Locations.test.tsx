import { screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import Locations, { LOCATIONS_QUERY } from "./Locations";
import { render } from "utils/test-utils";
import { Route } from "react-router-dom";

describe("Locations view", () => {
  const mocks = [
    {
      request: {
        query: LOCATIONS_QUERY,
        variables: {
          baseId: "123"
        },
      },
      result: {
        data: {
          base: {
            locations: [
              {
                __typename: "Location",
                id: 1,
                name: "Shop",
                boxes: [],
              },
              {
                __typename: "Location",
                id: 2,
                name: "LOST",
                boxes: [],
              },
            ],
          },
        },
      },
    },
  ];
  beforeEach(() => {
    render(<Locations />, {
      routePath: "/bases/:baseId/locations",
      initialUrl: "/bases/123/locations",
      mocks
    });
  });
  it("renders with an initial 'Loading...'", async () => {
    const loadingInfo = screen.getByText("Loading...");
    expect(loadingInfo).toBeInTheDocument();
  });

  it("eventually removes the 'Loading...' and shows the title", async () => {
    await waitFor(() => {
      const loadingInfo = screen.queryByText("Loading...");
      expect(loadingInfo).toBeNull();
    });
    const heading = await screen.findByRole("heading", { level: 2, name: "Locations" });
    expect(heading).toBeInTheDocument();
  });

  describe("after done with data loading", () => {
    beforeEach(async () => {
      await waitFor(() => {
        const loadingInfo = screen.queryByText("Loading...");
        expect(loadingInfo).toBeNull();
      });
    });
    it("shows the locations list", async () => {
      const locationList = screen.getByTestId("locations-list");
      expect(locationList).toBeInTheDocument();
      const firstLocationItem = screen.getByRole("link", { name: 'Shop' })
      expect(firstLocationItem).toBeInTheDocument()
    });
  });
});