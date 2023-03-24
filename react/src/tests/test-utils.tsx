/* eslint-disable react/function-component-definition */
/* eslint-disable no-console */
import React, { ReactNode } from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider, MockedResponse, MockLink } from "@apollo/client/testing";
import { onError } from "@apollo/client/link/error";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { theme } from "utils/theme";
import { ChakraProvider } from "@chakra-ui/react";
import "mutationobserver-shim";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
  DefaultOptions,
} from "@apollo/client";
import {
  GlobalPreferencesContext,
  IGlobalPreferencesContext,
} from "providers/GlobalPreferencesProvider";
import { organisation1 } from "mocks/organisations";
import { base1 } from "mocks/bases";

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
 * @param ui - The React element to render.
 * @param options - The options object.
 * @param options.mocks - An array of `MockedResponse` objects from `@apollo/client/testing`. These objects define the mocked responses for GraphQL queries and mutations.
 * @param options.routePath - A string representing the path of the route that the `ui` component should be rendered at.
 * @param options.initialUrl - A string representing the initial URL that the `MemoryRouter` should be initialized with.
 * @param options.additionalRoute - A string representing a path the ui component might redirect to.
 * @param options.renderOptions - Additional options that can be passed to the `rtlRender` function from `@testing-library/react`.
 * @returns An object containing the rendered component and functions for interacting with it.
 */

function render(
  ui,
  {
    mocks = [],
    routePath,
    initialUrl,
    additionalRoute = undefined,
    addTypename = false,
    globalPreferences,
    ...renderOptions
  }: {
    mocks?: Array<MockedResponse>;
    routePath: string;
    initialUrl: string;
    additionalRoute?: string;
    addTypename?: boolean;
    globalPreferences?: IGlobalPreferencesContext;
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

  const globalPreferencesMock: IGlobalPreferencesContext = {
    dispatch: jest.fn(),
    globalPreferences: {
      selectedBaseId: base1.id,
      selectedOrganisationId: organisation1.id,
      availableBases: organisation1.bases,
    },
  };

  const Wrapper: React.FC = ({ children }: any) => (
    <ChakraProvider theme={theme}>
      <GlobalPreferencesContext.Provider value={globalPreferences ?? globalPreferencesMock}>
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
      </GlobalPreferencesContext.Provider>
    </ChakraProvider>
  );
  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
}

function StorybookApolloProvider({ children }: { children: ReactNode }) {
  const httpLink = new HttpLink({
    uri: "http://localhost:6006/MOCKED-graphql",
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions,
    link: httpLink,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export * from "@testing-library/react";
export { render, StorybookApolloProvider };
