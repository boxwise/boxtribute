import React from "react";
import { render, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import CreateBox from "./CreateBox";
import { CREATE_BOX } from "../../utils/queries";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import "mutationobserver-shim";
import TestRenderer from "react-test-renderer";
const { act } = TestRenderer;

const mocks = [
  {
    request: {
      query: CREATE_BOX,
      variables: {
        productId: 2,
        items: 2,
        locationId: 2,
        comments: "",
        sizeId: 2,
        qrBarcode: "387b0f0f5e62cebcafd48383035a92a",
      },
    },
    result: {
      data: {
        createBox: {
          id: 555,
          box_id: 456,
          product_id: 123,
          items: 50,
        },
      },
    },
  },
];

describe("Renders components", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("renders a header titled, `Create a Box`", () => {
    expect(component.getByRole("heading", { name: /create a box/i })).toHaveTextContent(
      "Create a Box",
    );
  });

  it("renders a form", () => {
    expect(component.getByTestId("createBoxForm")).toBeTruthy();
  });

  it("renders the correct 5 fields within the form", () => {
    expect(component.getByText(/locationid*/i)).toBeTruthy();
    expect(component.getByText(/productid*/i)).toBeTruthy();
    expect(component.getByText(/items*/i)).toBeTruthy();
    expect(component.getByText(/sizeid*/i)).toBeTruthy();
    expect(component.getByText(/comments*/i)).toBeTruthy();
  });

  it("renders a submit button titled, `do the mutation`", () => {
    expect(component.getByRole("button", { name: /do the mutation/i })).toHaveTextContent(
      "do the mutation",
    );
  });
});

describe("Submission result screen is shown the right way", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("After a successful submission, the form disappears and a screen with `You created a new box` appears with a box-id", async () => {
    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    fireEvent.click(submitBtn);

    await waitFor(() => component.getByTestId("createdBox"));

    expect(component.queryByTestId("createBoxForm")).toBeNull();
    expect(component.getByTestId("createdBox")).toBeTruthy();
    expect(component.getByRole("heading", { name: /the box id is: 456/i })).toHaveTextContent(
      "The Box ID is: 456",
    );
  });
});

describe("Required form fields prohibit submission when blank", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("does nothing when locationId, productId, items, and sizeId are blank", async () => {
    const inputFields = component.getAllByRole("textbox");
    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    for (let i = 0; i < inputFields.length; i++) {
      fireEvent.change(inputFields[i], { target: { value: "" } });
    }

    fireEvent.click(submitBtn);

    await waitFor(() => component.getByTestId("createBoxForm"));

    expect(component.getByTestId("createBoxForm")).toBeTruthy();
  });
});

describe("Loading and error state after submission", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = TestRenderer.create(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("renders `loading` while loading", () => {
    const submitBtn = component.root.findByType("button");

    submitBtn.props.onClick();

    const tree = component.toJSON();

    expect(tree.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: ["Loading..."],
        }),
      ]),
    );
  });
});
