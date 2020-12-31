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
  it("renders a header titled, `Create a Box`", () => {
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

  it("renders the correct 5 fields within the form", () => {
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

    expect(component.getByText(/locationid*/i)).toBeTruthy();
    expect(component.getByText(/productid*/i)).toBeTruthy();
    expect(component.getByText(/items*/i)).toBeTruthy();
    expect(component.getByText(/sizeid*/i)).toBeTruthy();
    expect(component.getByText(/comments*/i)).toBeTruthy();
  });

  it("renders a submit button titled, `do the mutation`", () => {
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

    expect(component.getByRole("button", { name: /do the mutation/i })).toHaveTextContent(
      "do the mutation",
    );
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
