import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import CreateBox from "./CreateBox";
import { CREATE_BOX } from "../../utils/queries";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

const mocks = [
  {
    request: {
      query: CREATE_BOX,
      variables: {
        productId: 123,
        items: 50,
        locationId: 999,
        comments: "A good box",
        sizeId: 25,
        qrBarcode: "abc123",
      },
    },
    result: {
      data: {
        box: {
          product_id: 123,
          sizeId: 25,
          items: 50,
          location_id: 999,
          comments: "A good box",
          qr_barcode: "abc123",
        },
      },
    },
  },
];

afterEach(cleanup);

describe("renders components", () => {
  it("renders correct header", () => {
    const history = createMemoryHistory();
    const component = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );

    expect(component.getByTestId("mainHeader")).toHaveTextContent("Create a Box");
  });
});

/*
describe("mock data", () => {
  it("returns correct data", () => {
    <MockedProvider mocks={mocks}>
      <CreateBox />
    </MockedProvider>;
  });
});
 */
