import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Auth0ProviderWithHistory from "providers/Auth0ProviderWithHistory";
import ApolloAuth0Provider from "providers/ApolloAuth0Provider";
import { GlobalPreferencesProvider } from "providers/GlobalPreferencesProvider";
import * as Sentry from "@sentry/react";
import App from "./App";
import { theme } from "./utils/theme";
import { captureConsoleIntegration } from "@sentry/react";
import React from "react";
import {IntlProvider} from 'react-intl';

const locale = "fr";
const messages = {
  "fr": {
    find_box: "Trouve box",
    account: "Compte de {name}",
    logout: "Déconnecte-toi",
  },
  "en": {
    find_box: "Find box",
    account: "Account of {name}",
    logout: "Logout",
  }
};
const ProtectedApp = withAuthenticationRequired(() => (
  <ApolloAuth0Provider>
    <GlobalPreferencesProvider>
      <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
        <App />
      </IntlProvider>
    </GlobalPreferencesProvider>
  </ApolloAuth0Provider>
));

const SentryProfiledProtectedApp = Sentry.withProfiler(ProtectedApp);

const sentryDsn = import.meta.env.FRONT_SENTRY_FE_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      captureConsoleIntegration({
        levels: ["error"],
      }),
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate: parseFloat(import.meta.env.FRONT_SENTRY_TRACES_SAMPLE_RATE || "0.0"),
    environment: import.meta.env.FRONT_SENTRY_ENVIRONMENT,
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ChakraProvider theme={theme}>
    <CSSReset />
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <SentryProfiledProtectedApp />
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </ChakraProvider>,
);

// TODO: PWA with vite-plugin-pwa
