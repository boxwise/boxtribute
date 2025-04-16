import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { theme } from "@boxtribute/shared-components/utils/theme";
import App from "./App";

const client = new ApolloClient({
  // TODO: get URI from ENV.
  uri: "http://localhost:5005/public",
  cache: new InMemoryCache({
    typePolicies: {
      DimensionInfo: {
        keyFields: ["id", "name"],
      },
    },
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <CSSReset />
      <BrowserRouter>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
