import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import ApolloAuth0Provider from "./providers/ApolloAuth0Provider";
import App from "./App";
import { ChakraProvider, CSSReset, extendTheme } from "@chakra-ui/react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { GlobalPreferencesProvider } from "providers/GlobalPreferencesProvider";
import Auth0ProviderWithHistory from "providers/Auth0ProviderWithHistory";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CaptureConsole } from '@sentry/integrations';

if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser')
  worker.start()
}

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
  primary: {
    700: "light-blue",
    500: "blue",
  },
};

const theme = extendTheme({
  colors,
  components: {
    FormLabel: {
      baseStyle: {
        fontWeight: "bold",
      },
    },
  },
});

const AuthenticationProtectedApp = withAuthenticationRequired(App);

const SentryProfiledApp = Sentry.withProfiler(AuthenticationProtectedApp);

const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new CaptureConsole({
        levels: ["error"],
      }),
      new BrowserTracing(),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // TODO: probably we want to later on differentiate 'PRODUCTION' even more - into 'STAGING' and actual 'PRODUCTION'/'LIVE'
    environment: process.env.SENTRY_ENVIRONMENT
  });
};

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <CSSReset />
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <ApolloAuth0Provider>
          <GlobalPreferencesProvider>
            <SentryProfiledApp />
          </GlobalPreferencesProvider>
        </ApolloAuth0Provider>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </ChakraProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
