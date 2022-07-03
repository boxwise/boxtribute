import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import ApolloAuth0Provider from "./providers/ApolloAuth0Provider";
import App from "./App";
import { ChakraProvider, CSSReset, extendTheme } from "@chakra-ui/react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { GlobalPreferencesProvider } from "providers/GlobalPreferencesProvider";
import Auth0ProviderWithHistory from "providers/Auth0ProviderWithHistory";
import { DistroSpotsForBaseIdQuery, DistroSpotsForBaseIdQueryVariables, DistributionEventState } from "types/generated/graphql";

import { graphql as mockedGraphql } from "msw";

if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser')

  worker.use(
    mockedGraphql.query<
      DistroSpotsForBaseIdQuery,
      DistroSpotsForBaseIdQueryVariables
    >("DistroSpotsForBaseId", (req, res, ctx) => {
      const mockedDistroSpotsForBaseIdData = {
        base: {
          __typename: "Base",
          distributions: {
            __typename: "Distributions",
            distributionSpots: [
              {
                __typename: "DistributionSpot",
                id: "1",
                name: "Horgos (River)",
                latitude: 132.142,
                longitude: 132.142,
                distributionEvents: [
                  {
                    __typename: "DistributionEvent",
                    id: "3",
                    name: "Warm Clothes and Tea",
                    dateTime: "2022-06-01T14:48:25+00:00",
                    state: DistributionEventState.Planning,
                  }
                ],
              },
            ],
          },
        },
      } as DistroSpotsForBaseIdQuery;
      return res(
        ctx.data(mockedDistroSpotsForBaseIdData)
      );
    })
  );

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
    Input: {
      sizes: {
        lg: {
          field: {
            borderRadius: 'none',
          },
        },
      },
    },
  },
});

const AuthenticationProtectedApp = withAuthenticationRequired(App);

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <CSSReset />
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <ApolloAuth0Provider>
          <GlobalPreferencesProvider>
            <AuthenticationProtectedApp />
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
