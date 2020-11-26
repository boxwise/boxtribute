import React from "react";
import { render, cleanup } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import CreateBox from "./CreateBox";
import { CREATE_BOX } from "../../utils/queries";
import "@testing-library/jest-dom";

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
  it("renders correctly initially", () => {
    <MockedProvider mocks={mocks} addTypename={false}>
      <CreateBox />
    </MockedProvider>;
  });
});
