import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Auth0ProviderWithHistory from "providers/Auth0ProviderWithHistory";
import ApolloAuth0Provider from "providers/ApolloAuth0Provider";
import * as Sentry from "@sentry/react";
import App from "./App";
import { captureConsoleIntegration } from "@sentry/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { customSystem } from "@boxtribute/shared-components/utils/theme";
import { Toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";

const ProtectedApp = withAuthenticationRequired(() => (
  <ApolloAuth0Provider>
    <App />
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
  <ChakraProvider value={customSystem}>
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <SentryProfiledProtectedApp />
      </Auth0ProviderWithHistory>
    </BrowserRouter>
    <Toaster />
  </ChakraProvider>,
);

// TODO: PWA with vite-plugin-pwa
