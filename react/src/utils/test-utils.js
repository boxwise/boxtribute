import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Router } from "react-router-dom";
import "mutationobserver-shim";

function render(ui, { mocks, history, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}> {children} </Router>
      </MockedProvider>
    );
  }
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { render };
