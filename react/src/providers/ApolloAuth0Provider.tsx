// Following this solution
// https://github.com/samjulien/apollo-auth0-fullstack/blob/master/habit-tracker/src/ApolloWrapper.js
// https://www.youtube.com/watch?v=FROhOGcnQxs

import React, { useState, useEffect, ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
  DefaultOptions,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";
import { onError } from "@apollo/client/link/error";
import { useErrorHandling } from "hooks/useErrorHandling";

export const cache = new InMemoryCache({
  typePolicies: {
    Box: {
      // Boxes should be normalized by labelIdentifier
      keyFields: ["labelIdentifier"],
    },
  },
});

function ApolloAuth0Provider({ children }: { children: ReactNode }) {
  const { triggerError } = useErrorHandling();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [auth0Token, setAuth0Token] = useState<String>("");
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_SERVER,
  });

  useEffect(() => {
    const getAuth0Token = async () => {
      const token = isAuthenticated ? await getAccessTokenSilently() : "";
      setAuth0Token(token);
    };
    getAuth0Token();
  }, [isAuthenticated, getAccessTokenSilently]);

  const auth0Link = setContext((_, { headers, ...rest }) => {
    if (!auth0Token) return { headers, ...rest };

    return {
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${auth0Token}`,
        "X-Clacks-Overhead": "GNU Terry Pratchett",
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        triggerError({
          message: `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          userMessage: "Something went wrong!",
        }),
      );
    }
    if (networkError) {
      triggerError({
        message: `[Network error]: ${networkError}`,
        userMessage: "Network Error! Please check your Internet connection!",
      });
    }
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
    cache,
    // HINT: Ideally, only set this temporary to true for local debugging
    // or make the usage here conditional based on the environment.
    connectToDevTools: true,
    link: auth0Link.concat(errorLink).concat(httpLink),
    defaultOptions,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default ApolloAuth0Provider;
