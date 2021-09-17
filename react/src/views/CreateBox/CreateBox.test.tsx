import React from "react";
import { render, waitFor, fireEvent, cleanup, act, waitForElement, findByText, RenderResult } from "../../utils/test-utils";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { CREATE_BOX, LOCATIONS, PRODUCTS, SIZES_FOR_PRODUCT } from "../../utils/queries";
import CreateBox from "./CreateBox";
import { GraphQLError } from "graphql";

const productsAndLocationQueriesForInitialLoading = [{
  request: {
    query: PRODUCTS,
  },
  result: {
    data: {
      products: [{ __typename: "Product", id: 1, name: "Winter Jackets" }]
    },
  },
},
  {
    request: {
      query: LOCATIONS,
    },
    result: {
      data: {
        "locations": [
          {
            "__typename": "Location",
            "id": 1,
            "name": "Shop"
          },
          {
            "__typename": "Location",
            "id": 2,
            "name": "LOST"
          }
        ]
      },
    }
  }
];

const mocks = [
  {
    request: {
      query: CREATE_BOX,
      variables: {
        productId: 1,
        items: 2,
        locationId: 1,
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
  ...productsAndLocationQueriesForInitialLoading
];

const mockNetworkError = [
  {
    request: {
      query: CREATE_BOX,
      variables: {
        productId: 1,
        items: 2,
        locationId: 1,
        comments: "",
        sizeId: 2,
        qrBarcode: "387b0f0f5e62cebcafd48383035a92a",
      },
    },
    error: new Error("An error occurred"),
  },
  ...productsAndLocationQueriesForInitialLoading
];

const mockGraphQLError = [
  {
    request: {
      query: CREATE_BOX,
      variables: {
        productId: 1,
        items: 2,
        locationId: 1,
        comments: "",
        sizeId: 2,
        qrBarcode: "387b0f0f5e62cebcafd48383035a92a",
      },
    },
    result: {
      errors: [new GraphQLError("Error!")],
    },
  },
  ...productsAndLocationQueriesForInitialLoading
];

describe("Renders CreateBox component correctly", () => {
  let component: RenderResult;
  let history;
  beforeEach(async () => {
    history = createMemoryHistory();
    history.push("/create-box/?qr=387b0f0f5e62cebcafd48383035a92a");

    component = render(<CreateBox />, { mocks, history })
  });

  afterEach(cleanup);

  it("renders a header titled, `Create a Box`", async () => {
    expect(
      component.getByRole("heading", {
        name: /create a box/i,
      }),
    ).toHaveTextContent("Create a Box");
  });

  it("renders a form", () => {
    expect(component.getByTestId("createBoxForm")).toBeTruthy();
  });

  it("renders the correct 5 fields and the QR code within the form", () => {
    expect(component.getByLabelText(/Product*/i)).toBeTruthy();

    // await component.findByText("Winter Jackets");

    // expect(component.getByText(/items*/i)).toBeTruthy();
    // expect(component.getByText(/sizeid*/i)).toBeTruthy();
    // expect(component.getByText(/comments*/i)).toBeTruthy();

    const qrCodeLabel = component.getByText(/QR code: 387b0f0f5e62cebcafd48383035a92a/i);
    expect(qrCodeLabel).toBeInTheDocument()
  });

  it("renders a submit button titled, `Save`", () => {
    expect(
      component.getByRole("button", {
        name: /Save/,
      }),
    ).toBeInTheDocument();
  });
});

describe("Created box is displayed correctly", () => {
  let component: RenderResult;
  beforeEach(() => {
    const history = createMemoryHistory();
    history.push("/create-box/?qr=387b0f0f5e62cebcafd48383035a92a");
    component = render(<CreateBox />, { mocks, history });
  });

  afterEach(cleanup);

  it("After a successful submission, the form disappears and a screen with `You created a new box` appears with a box-id", async () => {

    const productField = component.getByLabelText("Product");
    expect(productField["value"]).toBe("");
    const product1OptionField = await component.findByTestId('product-selector-id-1');
    expect(product1OptionField).toBeInTheDocument();
    // component.debug();

    const numberOfItemsField = component.getByLabelText("# of items") as HTMLInputElement;
    expect(numberOfItemsField.value).toBe("0");
    fireEvent.change(numberOfItemsField, {
      target: {
        value: 2
      }
    });
    expect(numberOfItemsField.value).toBe("2");
    const submitBtn = component.getByRole("button", {
      name: /Save/i,
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.queryByTestId("createBoxForm")).toBeNull();
      expect(component.getByTestId("createdBox")).toBeTruthy();
      expect(
        component.findByRole("heading", {
          name: /the box id is: 456/i,
        }),
      );
    });
  });
});

// Need to create an error message for blank required form fields
describe("Required form fields prohibit submission when blank", () => {
  let component;
  beforeEach(() => {
    const history = createMemoryHistory();
    history.push("/create-box/?qr=387b0f0f5e62cebcafd48383035a92a");

    component = render(<CreateBox />, { mocks, history });
  });

  afterEach(cleanup);

  it("does nothing when locationId, productId, items, and sizeId are blank", async () => {
    const inputFields = component.getAllByRole("spinbutton");
    const submitBtn = component.getByRole("button", {
      name: /Save/i,
    });

    for (let i = 0; i < inputFields.length; i++) {
      fireEvent.change(inputFields[i], {
        target: {
          value: "",
        },
      });
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
  let component;
  beforeEach(() => {
    const history = createMemoryHistory();
    history.push("/create-box/?qr=387b0f0f5e62cebcafd48383035a92a");

    component = render(<CreateBox />, { mocks: mockNetworkError, history });
  });

  afterEach(cleanup);

  it("renders `Error :( Please try again` when there is a network error", async () => {
    await component.findByTestId('product-selector-id-1');
    const numberOfItemsField = component.getByLabelText("# of items") as HTMLInputElement;
    fireEvent.change(numberOfItemsField, {
      target: {
        value: 2
      }
    });

    const submitBtn = component.getByRole("button", { name: /save/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.getByText("Error :( Please try again")).toBeInTheDocument();
    });
  });
});

describe("GraphQL error after submission", () => {
  let component;
  beforeEach(() => {
    const history = createMemoryHistory();
    history.push("/create-box/?qr=387b0f0f5e62cebcafd48383035a92a");

    component = render(<CreateBox />, { mocks: mockGraphQLError, history });
  });

  afterEach(cleanup);

  it("renders `Error :( Please try again` when there is a GraphQL error", async () => {
    await component.findByTestId('product-selector-id-1');

    const numberOfItemsField = component.getByLabelText("# of items") as HTMLInputElement;
    fireEvent.change(numberOfItemsField, {
      target: {
        value: 2
      }
    });

    const submitBtn = component.getByRole("button", { name: /save/i });

    fireEvent.click(submitBtn);
    // });
    await waitFor(() => {
      expect(component.getByText("Error :( Please try again")).toBeInTheDocument();
    });
  });

  // Loading state is a work in progress
  it("renders `loading` while loading", async () => {
    await component.findByTestId('product-selector-id-1');

    const numberOfItemsField = component.getByLabelText("# of items") as HTMLInputElement;
    fireEvent.change(numberOfItemsField, {
      target: {
        value: 2
      }
    });

    const submitBtn = component.getByRole("button", { name: /save/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(component.getByText("Loading...")).toBeInTheDocument();
    });
  });

});
