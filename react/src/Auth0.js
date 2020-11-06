import createAuth0Client from '@auth0/auth0-spa-js';

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
 
  async getAuth0 () {
     
    return await createAuth0Client({
        domain: REACT_APP_AUTH0_DOMAIN,
        clientID: REACT_APP_AUTH0_CLIENT_ID,
        redirectUri: REACT_APP_REDIRECT,
  })};

  auth0 = this.getAuth0();



  async login() { 
     return await this.auth0.loginWithRedirect({
      audience: REACT_APP_AUTH0_AUDIENCE,
      scope: "openid profile email",
      responseType: "id_token token",
    });
  }

  async handleAuthentication() {
    return await this.auth0.handleRedirectCallback();
    
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
