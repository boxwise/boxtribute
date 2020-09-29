import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../views/Home";

// initializes the Home class for testing
let getByText;
let findAllyByText;
// let container

beforeEach(() => {
  const queries = render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>,
  );
  getByText = queries.getByText;
  findAllyByText = queries.findAllByText;
  // container = queries.container
});

describe("renders components", () => {
  it("renders welcome message correctly", async () => {
    const welcomeText = getByText(/welcome to boxwise! please log in./i);
    expect(welcomeText).toBeInTheDocument();
  });
  it("renders 3 different orgs of name ABC", async () => {
    const abcText = await findAllyByText(/org abc/i);
    expect(abcText).toHaveLength(3);
  });
});

describe("links redirect", () => {
  const getUrl = window.location;
  const baseUrl = `${getUrl.protocol}//${getUrl.host}${getUrl.pathname.split("/")[1]}`;
  it("redirects to correct base for pick list", async () => {
    const abcText = getByText(/org abc, base 1, pick list/i);
    expect(abcText.href).toBe(`${baseUrl}/org/abc/base/base1/pick-list`);
  });
});
