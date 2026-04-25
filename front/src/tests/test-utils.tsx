/* eslint-disable import/export */
// TODO: Investigate possible render function overload.

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
import { useHydrateAtoms } from "jotai/utils";
import { FakeGraphQLError, FakeGraphQLNetworkError, mockMatchMediaQuery } from "mocks/functions";
import { Provider } from "jotai";
import {
  availableBasesAtom,
  organisationAtom,
  selectedBaseAtom,
} from "stores/globalPreferenceStore";
import { basicBase1 } from "mocks/bases";
import { basicOrg1 } from "mocks/organisations";

// Options for Apollo MockProvider
const defaultOptions: DefaultOptions = {
  query: {
    errorPolicy: "all",
  },
  mutate: {
    errorPolicy: "all",
  },
};

// Hydrate Jotai Atoms for testing
// https://jotai.org/docs/guides/testing
function HydrateAtoms({ initialValues, children }) {
  useHydrateAtoms(initialValues);
  return children;
}
function JotaiTestProvider({
  initialValues,
  children,
}: {
  initialValues: Iterable<any>;
  children: any;
}) {
  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  );
}

export const jotaiAtomsInitialValues = [
  [selectedBaseAtom, basicBase1],
  [organisationAtom, basicOrg1],
  [availableBasesAtom, [basicBase1]],
];

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
 * @param {Iterable<any>} [options.jotaiAtoms] - An iterable mocking jotai atoms for the rendered component.
 * @param {boolean} [options.mediaQueryReturnValue=true] - The return value for the mocked `window.matchMedia` function. This function is needed if the useMediaQuery is called.
 * @param {Object} options.renderOptions - Additional options that can be passed to the `rtlRender` function from `@testing-library/react`.
 * @returns {Object} An object containing the rendered component and functions for interacting with it.
 */

function render(
  ui,
  {
    mocks = [],
    cache = undefined,
    routePath,
    initialUrl,
    additionalRoute = undefined,
    addTypename = false,
    jotaiAtoms = jotaiAtomsInitialValues,
    mediaQueryReturnValue = true,
    ...renderOptions
  }: {
    mocks?: Array<MockedResponse>;
    cache?: InMemoryCache;
    routePath: string;
    initialUrl: string;
    additionalRoute?: string;
    addTypename?: boolean;
    jotaiAtoms?: Iterable<any>;
    mediaQueryReturnValue?: boolean;
  },
) {
  // set showWarnings to false, as we'll log them via the onError callback instead
  const mockLink = new MockLink(mocks, undefined, { showWarnings: false });
  const errorLoggingLink = onError((error: any) => {
    const { graphQLErrors, networkError } = error;
    if (graphQLErrors) {
      for (const error of graphQLErrors) {
        // log errors, but only if they aren't ones we set up in a mock
        // TODO: figure out how to fail the outer test once these are fixed
        if (!(error instanceof FakeGraphQLError)) {
          console.error(`[GraphQL error]: ${error}`);
        }
      }
      return;
    }
    if (networkError) {
      // log errors, but only if they aren't ones we set up in a mock
      // TODO: figure out how to fail the outer test once these are fixed
      if (!(networkError instanceof FakeGraphQLNetworkError)) {
        console.error(`[GraphQL network error]: ${networkError}`);
      }
      return;
    }
    console.error(`[Unknown Error]: ${error}`);
  });
  mockLink.setOnError((error) => {
    console.error(`[MockLink Error]: ${error}`);
  });

  const link = ApolloLink.from([errorLoggingLink, mockLink]);

  mockMatchMediaQuery(mediaQueryReturnValue);

  const Wrapper: React.FC = ({ children }: any) => (
    <ChakraProvider theme={theme}>
      <MockedProvider
        mocks={mocks}
        addTypename={addTypename}
        link={link}
        defaultOptions={defaultOptions}
        cache={cache}
      >
        <JotaiTestProvider initialValues={jotaiAtoms}>
          <MemoryRouter initialEntries={[initialUrl]}>
            <Routes>
              {additionalRoute !== undefined && (
                <Route path={additionalRoute} element={<h1>{additionalRoute}</h1>} />
              )}
              <Route path={routePath} element={children} />
            </Routes>
          </MemoryRouter>
        </JotaiTestProvider>
      </MockedProvider>
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
