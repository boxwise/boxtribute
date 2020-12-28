import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import CreateBox from "./CreateBox";
import { CREATE_BOX } from "../../utils/queries";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import "mutationobserver-shim";

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
    const state = { qr: "387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    const component = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );

    expect(component.getByRole("heading", { name: /create a box/i })).toHaveTextContent(
      "Create a Box",
    );
  });

  it("renders a form", () => {
    const history = createMemoryHistory();
    const state = { qr: "387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    const component = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );

    expect(component.getByTestId("createBoxForm")).toBeTruthy();
  });

  // Test that the form has 5 fields

  // Test that the submit button is present
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
