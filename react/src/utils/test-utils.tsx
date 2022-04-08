import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter, Routes } from "react-router-dom";
import "mutationobserver-shim";

function render(
  ui,
  {
    mocks,
    initialUrl,
    ...renderOptions
  }: { mocks: Array<MockedResponse>; initialUrl: string },
) {
  const Wrapper: React.FC = ({ children }) => {
    return (
      <>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter initialEntries={[initialUrl]}>
            <Routes>{children}</Routes>
          </MemoryRouter>
        </MockedProvider>
      </>
    );
  };
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { render };
