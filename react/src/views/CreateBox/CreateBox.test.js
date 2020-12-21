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

  it("renders correct header", () => {
    expect(component.getByTestId("mainHeader")).toHaveTextContent("Create a Box");
  });

  // Test that the form, targeted by a testid, exists
  it("renders a form", () => {
    expect(component.getByTestId("createBoxForm")).toBeTruthy();
  });

  // Test that the form has 5 fields

  // Test the labels of those 5 fields are accurate
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
