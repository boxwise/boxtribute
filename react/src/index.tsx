import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { GlobalPreferencesProvider } from "providers/GlobalPreferencesProvider";
import Auth0ProviderWithHistory from "providers/Auth0ProviderWithHistory";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";
import App from "./App";
import ApolloAuth0Provider from "./providers/ApolloAuth0Provider";
import { theme } from "./utils/theme";

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line global-require
  // const { worker } = require("./mocks/browser");
  // worker.use(
  //   mockedGraphql.query<
  //     DistroSpotsForBaseIdQuery,
  //     DistroSpotsForBaseIdQueryVariables
  //   >("DistroSpotsForBaseId", (req, res, ctx) => {
  //     const mockedDistroSpotsForBaseIdData = {
  //       base: {
  //         __typename: "Base",
  //           distributionSpots: [
  //             {
  //               __typename: "DistributionSpot",
  //               id: "1",
  //               name: "Horgos (River)",
  //               latitude: 132.142,
  //               longitude: 132.142,
  //               distributionEvents: [
  //                 {
  //                   __typename: "DistributionEvent",
  //                   id: "3",
  //                   name: "Warm Clothes and Tea",
  //                   startDateTime: "2022-06-01T14:48:25+00:00",
  //                   state: DistributionEventState.Planning,
  //                 }
  //               ],
  //             },
  //           ],
  //       },
  //     } as DistroSpotsForBaseIdQuery;
  //     return res(
  //       ctx.data(mockedDistroSpotsForBaseIdData)
  //     );
  //   })
  // );
  // worker.start();
}

const AuthenticationProtectedApp = withAuthenticationRequired(App);

const SentryProfiledApp = Sentry.withProfiler(AuthenticationProtectedApp);

const sentryDsn = process.env.REACT_APP_SENTRY_FE_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new CaptureConsole({
        levels: ["error"],
      }),
      new BrowserTracing(),
    ],
    tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || "0.0"),
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
  });
}

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
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
