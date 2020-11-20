// Following this guide
// https://auth0.com/blog/complete-guide-to-react-user-authentication/#Set-Up-the-Auth0-React-SDK

import React from "react";
import { useHistory } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
 
const Auth0ProviderWithHistory = ({ children }) => {
  const domain = (process.env.REACT_APP_AUTH0_DOMAIN as string);
  const clientId = (process.env.REACT_APP_AUTH0_CLIENT_ID as string);
  const audience = (process.env.REACT_APP_AUTH0_AUDIENCE as string);

  const history = useHistory();

  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider 
      domain={domain}
      clientId={clientId}
      audience={audience}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;