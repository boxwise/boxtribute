import React, { FunctionComponent } from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { Router } from "react-router-dom";
import "mutationobserver-shim";

function render(ui, { mocks, history, ...renderOptions }: { mocks: Array<MockedResponse>, history: any }) {
  const Wrapper: React.FC = ({ children }) => {
    return (<>
      <MockedProvider mocks={mocks} addTypename={false} >
        <Router history={history}>{children}</Router>
      </MockedProvider>
    </>
    );
  }
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { render };
