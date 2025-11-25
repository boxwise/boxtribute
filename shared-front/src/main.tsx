import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import * as Sentry from "@sentry/react";
import { captureConsoleIntegration } from "@sentry/react";

import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { customSystem } from "@boxtribute/shared-components/utils/theme";

const client = new ApolloClient({
  uri: import.meta.env.SHARED_FRONT_GRAPHQL_SERVER,
  cache: new InMemoryCache({
    typePolicies: {
      DimensionInfo: {
        keyFields: ["id", "name"],
      },
    },
  }),
});

const SentryProfiledApp = Sentry.withProfiler(() => <App />);

const sentryDsn = import.meta.env.SHARED_FRONT_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      captureConsoleIntegration({
        levels: ["error"],
      }),
    ],
    tracesSampleRate: parseFloat(import.meta.env.SHARED_FRONT_SENTRY_TRACES_SAMPLE_RATE || "0.0"),
    environment: import.meta.env.SHARED_FRONT_SENTRY_ENVIRONMENT,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={customSystem}>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <SentryProfiledApp />
        </ApolloProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
