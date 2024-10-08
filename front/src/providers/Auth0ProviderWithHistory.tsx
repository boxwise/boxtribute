// Following this guide
// https://auth0.com/blog/complete-guide-to-react-user-authentication/#Set-Up-the-Auth0-React-SDK
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

function Auth0ProviderWithHistory({ children }: { children: React.ReactNode }) {
  const domain = import.meta.env.FRONT_AUTH0_DOMAIN as string;
  const clientId = import.meta.env.FRONT_AUTH0_CLIENT_ID as string;
  const audience = import.meta.env.FRONT_AUTH0_AUDIENCE as string;

  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience,
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}

export default Auth0ProviderWithHistory;
