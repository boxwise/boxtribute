// Following this solution
// https://github.com/samjulien/apollo-auth0-fullstack/blob/master/habit-tracker/src/ApolloWrapper.js
// https://www.youtube.com/watch?v=FROhOGcnQxs

import { useState, useEffect, ReactNode } from "react";
import { ApolloClient, HttpLink, ApolloProvider, DefaultOptions, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";
import { onError } from "@apollo/client/link/error";
import { useErrorHandling } from "hooks/useErrorHandling";
import { cache } from "queries/cache";
import { getActiveSpan, startSpanManual } from "@sentry/react";

function ApolloAuth0Provider({ children }: { children: ReactNode }) {
  const { triggerError } = useErrorHandling();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [auth0Token, setAuth0Token] = useState<String>("");
  const httpLink = new HttpLink({
    uri: import.meta.env.FRONT_GRAPHQL_SERVER,
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

  function getTraceparentString() {
    const span = getActiveSpan();
    if (!span) {
      return undefined;
    }
    return `00-${span.spanContext().traceId}-${span.spanContext().spanId}-0${span.spanContext().traceFlags}`;
  }

  const createSpanLink = new ApolloLink((operation, forward) => {
    const result = startSpanManual({ name: `gql.${operation.operationName}` }, (span) => {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          traceparent: getTraceparentString(),
        },
      }));
      return forward(operation).map((data) => {
        span.end();
        return data;
      });
    });
    return result;
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        triggerError({
          message: `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}, Extensions: ${JSON.stringify(extensions?.description)}`,
          userMessage: "Something went wrong!",
        });
      });
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
    connectToDevTools: import.meta.env.FRONT_ENVIRONMENT !== "production",
    link: auth0Link.concat(errorLink).concat(createSpanLink).concat(httpLink),
    defaultOptions,
  });

  if (!auth0Token) {
    return <div />;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default ApolloAuth0Provider;
