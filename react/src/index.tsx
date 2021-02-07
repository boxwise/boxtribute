import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "./Auth0ProviderWithHistory";
import ApolloWrapper from "./ApolloWrapper";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "semantic-ui-less/semantic.less";

ReactDOM.render(
  <Router>
    <Auth0ProviderWithHistory>
      <ApolloWrapper>
        <App />
      </ApolloWrapper>
    </Auth0ProviderWithHistory>
  </Router>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
