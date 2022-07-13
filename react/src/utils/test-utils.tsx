import React, { ReactNode } from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "mutationobserver-shim";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
  DefaultOptions,
} from "@apollo/client";

function render(
  ui,
  {
    mocks,
    routePath,
    initialUrl,
    ...renderOptions
  }: { mocks: Array<MockedResponse>; routePath: string, initialUrl: string },
) {
  const Wrapper: React.FC = ({ children }: any) => {
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

function StorybookApolloProvider({ children }: { children: ReactNode }) {
  const httpLink = new HttpLink({
    uri: "http://localhost:6006/MOCKED-graphql"
  });

  const defaultOptions: DefaultOptions = {
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  };

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions,
    link: httpLink
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export * from "@testing-library/react";
export { render, StorybookApolloProvider };
