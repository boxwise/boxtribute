import * as Auth0 from "auth0-js";

// get your own by making an account at Auth0 and putting these in the .env file
// unless you change the CRA properties, both the REACT_APP_REDIRECT and REACT_APP_LOGOUT_URL=http://localhost:3000
const {
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_AUTH0_CLIENT_ID,
  REACT_APP_REDIRECT,
  REACT_APP_LOGOUT_URL,
  REACT_APP_AUTH0_AUDIENCE,
} = process.env;

class Auth {
  auth0 = new Auth0.WebAuth({
    domain: REACT_APP_AUTH0_DOMAIN,
    clientID: REACT_APP_AUTH0_CLIENT_ID,
  });

  login() {
    this.auth0.authorize({
      audience: REACT_APP_AUTH0_AUDIENCE,
      scope: "openid profile email",
      responseType: "id_token token",
      redirectUri: REACT_APP_REDIRECT,
    });
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      // Auth0 returns the token in the params of the URL after successful login
      // and redirect. Parse it to get the tokens.
      this.auth0.parseHash((err, authResult) => {
        if (err) reject(err);
        if (!authResult || !authResult.idToken) {
          reject(err);
        }

        // authResult contains both the accessToken
        // (I am a recognized user who has logged in) and the idToken
        // (here is some info about me as a specific user)
        // because the only useful info we have about the user is the email,
        // we need to send this to the backend and check there for access to org-specific info
        resolve(authResult);
      });
    });
  }

  logout() {
    this.auth0.logout({
      returnTo: REACT_APP_LOGOUT_URL,
      clientID: REACT_APP_AUTH0_CLIENT_ID,
    });
  }
}

const auth = new Auth();

export default auth;
