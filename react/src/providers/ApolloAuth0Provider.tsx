// Following this solution
// https://github.com/samjulien/apollo-auth0-fullstack/blob/master/habit-tracker/src/ApolloWrapper.js
// https://www.youtube.com/watch?v=FROhOGcnQxs

import { useState, useEffect, ReactNode, createContext, Context, useMemo } from "react";
import { ApolloClient, HttpLink, ApolloProvider, DefaultOptions, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";
import { onError } from "@apollo/client/link/error";
import { useErrorHandling } from "hooks/useErrorHandling";
import { cache } from "queries/cache";

export interface IApolloAuth0WrapperContext {
  isAccessTokenInHeader: Boolean;
}

export const ApolloAuth0WrapperContext: Context<IApolloAuth0WrapperContext> = createContext(
  {} as IApolloAuth0WrapperContext,
);

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

  const auth0Link = setContext((_, { headers, ...rest }) => ({
    ...rest,
    headers: {
      ...headers,
      Authorization: `Bearer ${auth0Token || ""}`,
      "X-Clacks-Overhead": "GNU Terry Pratchett",
    },
  }));

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
    connectToDevTools: process.env.REACT_APP_ENVIRONMENT !== "production",
    link: auth0Link.concat(errorLink).concat(httpLink),
    defaultOptions,
  });

  if (!auth0Token) {
    return <div />;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default ApolloAuth0Provider;
