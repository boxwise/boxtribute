/* eslint-disable import/export */
// TODO: Investigate possible render function overload.

import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedResponse, MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { onError } from "@apollo/client/link/error";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { ApolloLink, DefaultOptions } from "@apollo/client";
import { theme } from "../utils/theme";

// Options for Apollo MockProvider
const defaultOptions: DefaultOptions = {
  query: {
    errorPolicy: "all",
  },
  mutate: {
    errorPolicy: "all",
  },
};

/**
 * Renders a React component with Apollo GraphQL client and @testing-library/react.
 *
 * @param {React.ReactElement} ui - The React element to render.
 * @param {Object} options - The options object.
 * @param {MockedResponse[]} options.mocks - An array of `MockedResponse` objects from `@apollo/client/testing`. These objects define the mocked responses for GraphQL queries and mutations.
 * @param {string} options.routePath - A string representing the path of the route that the `ui` component should be rendered at.
 * @param {string} options.initialUrl - A string representing the initial URL that the `MemoryRouter` should be initialized with.
 * @param {string} [options.additionalRoute] - A string representing a path the `ui` component might redirect to.
 * @param {boolean} [options.addTypename=false] - Whether to include the `__typename` field in query results.
 * @returns {Object} An object containing the rendered component and functions for interacting with it.
 */

function render(
  ui,
  {
    mocks = [],
    addTypename = false,
    routePath,
    initialUrl,
    additionalRoute = undefined,
    ...renderOptions
  }: {
    mocks?: Array<MockedResponse>;
    addTypename?: boolean;
    routePath: string;
    initialUrl: string;
    additionalRoute?: string;
  },
) {
  // Log if there is an error in the mock
  const mockLink = new MockLink(mocks);
  const errorLoggingLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });
  const link = ApolloLink.from([errorLoggingLink, mockLink]);

  const Wrapper: React.FC = ({ children }: any) => (
    <ChakraProvider theme={theme}>
      <MockedProvider
        mocks={mocks}
        addTypename={addTypename}
        link={link}
        defaultOptions={defaultOptions}
      >
        <MemoryRouter initialEntries={[initialUrl]}>
          <Routes>
            {additionalRoute !== undefined && (
              <Route path={additionalRoute} element={<h1>{additionalRoute}</h1>} />
            )}
            <Route path={routePath} element={children} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </ChakraProvider>
  );
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { render };
