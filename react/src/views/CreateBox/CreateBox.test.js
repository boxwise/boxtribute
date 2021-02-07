import React from "react";
import { render, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import CreateBox from "./CreateBox";
import { CREATE_BOX } from "../../utils/queries";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import "mutationobserver-shim";
import { GraphQLError } from "graphql";

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

describe("Renders CreateBox component correctly", () => {
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

describe("Created box is displayed correctly", () => {
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

    await waitFor(() => {
      expect(component.queryByTestId("createBoxForm")).toBeNull();
      expect(component.getByTestId("createdBox")).toBeTruthy();
      expect(component.getByRole("heading", { name: /the box id is: 456/i })).toHaveTextContent(
        "The Box ID is: 456",
      );
    });
  });
});

// Need to create an error message for blank required form fields
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
    const inputFields = component.getAllByRole("spinbutton");
    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    for (let i = 0; i < inputFields.length; i++) {
      fireEvent.change(inputFields[i], { target: { value: "" } });
    }

    await waitFor(() => {
      for (let i = 0; i < inputFields.length; i++) {
        expect(inputFields[i].value).toBe("");
      }
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      // setTimeout compensates for lack of an error message
      setTimeout(() => {
        // expect an error message to appear (e.g. "Please fill out required form fields")
        expect(component.queryByTestId("createBoxForm")).toBeTruthy();
        expect(component.queryByTestId("createdBox")).toBeNull();
        expect(component.queryByTestId("loadingState")).toBeNull();
        expect(component.queryByTestId("errorState")).toBeNull();
      }, 5000);
    });
  });
});

describe("Network error after submission", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = render(
      <MockedProvider
        mocks={[
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
            error: new Error("An error occurred"),
          },
        ]}
        addTypename={false}
      >
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("renders `Error :( Please try again` when there is a network error", async () => {
    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.getByText("Error :( Please try again")).toBeInTheDocument();
    });
  });
});

describe("GraphQL error after submission", () => {
  let component = null;
  beforeEach(() => {
    const history = createMemoryHistory();
    const state = { qr: "barcode=387b0f0f5e62cebcafd48383035a92a" };
    history.push("/create-box", state);

    component = render(
      <MockedProvider
        mocks={[
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
              errors: [new GraphQLError("Error!")],
            },
          },
        ]}
        addTypename={false}
      >
        <Router history={history}>
          <CreateBox />
        </Router>
      </MockedProvider>,
    );
  });

  afterEach(cleanup);

  it("renders `Error :( Please try again` when there is a GraphQL error", async () => {
    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.getByText("Error :( Please try again")).toBeInTheDocument();
    });
  });
});

// Loading state is a work in progress
/*
  it("renders `loading` while loading", async () => {

    const submitBtn = component.getByRole("button", { name: /do the mutation/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.getByText("Loading...")).toBeInTheDocument();
    });
  });
  */
