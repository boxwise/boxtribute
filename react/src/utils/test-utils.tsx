import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "mutationobserver-shim";

function render(
  ui,
  {
    mocks,
    routePath,
    initialUrl,
    ...renderOptions
  }: { mocks: Array<MockedResponse>; routePath: string, initialUrl: string },
) {
  const Wrapper: React.FC = ({ children }) => {
    return (
      <>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter initialEntries={[initialUrl]}>
            <Routes>
              <Route path={routePath} element={children}></Route>
            </Routes>
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
