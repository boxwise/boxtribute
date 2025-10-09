import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import * as Sentry from "@sentry/react";
import { captureConsoleIntegration } from "@sentry/react";

import App from "./App";
import { theme } from "@boxtribute/shared-components/utils/theme";

const httpLink = new HttpLink({
  uri: import.meta.env.STATVIZ_GRAPHQL_SERVER,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      DimensionInfo: {
        keyFields: ["id", "name"],
      },
    },
  }),
});

const SentryProfiledApp = Sentry.withProfiler(() => <App />);

const sentryDsn = import.meta.env.STATVIZ_SENTRY_FE_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      captureConsoleIntegration({
        levels: ["error"],
      }),
    ],
    tracesSampleRate: parseFloat(import.meta.env.STATVIZ_SENTRY_TRACES_SAMPLE_RATE || "0.0"),
    environment: import.meta.env.STATVIZ_SENTRY_ENVIRONMENT,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <CSSReset />
      <BrowserRouter>
        <ApolloProvider client={client}>
          <SentryProfiledApp />
        </ApolloProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
